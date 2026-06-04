import { Inject, Injectable } from '@nestjs/common';

import {
  EVENT_SINKS,
  type EventSink,
} from 'src/engine/core-modules/audit/sinks/event-sink';
import {
  WORKSPACE_EVENTS_JOB_NAME,
  type WorkspaceEventEnvelope,
  type WorkspaceEventsJobData,
} from 'src/engine/core-modules/audit/types/workspace-event-envelope.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventLiveService } from 'src/engine/subscriptions/workspace-event-live.service';

// The unified event pipeline. Producers `enqueue()` batches onto the queue; the
// consumer (and the durable object-event worker) `ingest()` them — persisting to
// every configured sink and fanning out to live subscribers in one place.
//
// enqueue() lets queue errors propagate so producers can decide how to handle
// them (analytics emitters swallow + log; they never block their caller). ingest()
// throws on persistence failure so the consumer job retries.
@Injectable()
export class WorkspaceEventSinkService {
  constructor(
    @Inject(EVENT_SINKS)
    private readonly sinks: EventSink[],
    @InjectMessageQueue(MessageQueue.workspaceEventsQueue)
    private readonly workspaceEventsQueueService: MessageQueueService,
    private readonly workspaceEventLiveService: WorkspaceEventLiveService,
  ) {}

  // Whether any sink is configured; producers skip building events when nothing
  // is listening.
  isEnabled(): boolean {
    return this.sinks.length > 0;
  }

  async enqueue(events: WorkspaceEventEnvelope[]): Promise<void> {
    if (!this.isEnabled() || events.length === 0) {
      return;
    }

    await this.workspaceEventsQueueService.add<WorkspaceEventsJobData>(
      WORKSPACE_EVENTS_JOB_NAME,
      { events },
    );
  }

  async ingest(events: WorkspaceEventEnvelope[]): Promise<void> {
    // Persistence must throw on failure so the consumer job retries. The live
    // fan-out is awaited so the job isn't acked before it completes, but it
    // swallows its own errors internally and so can never trigger a retry (which
    // would double-write to ClickHouse).
    await this.persist(events);
    await this.workspaceEventLiveService.publishWatched(events);
  }

  private async persist(events: WorkspaceEventEnvelope[]): Promise<void> {
    await Promise.all(this.sinks.map((sink) => sink.write(events)));
  }
}
