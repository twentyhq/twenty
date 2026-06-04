import { Inject, Injectable } from '@nestjs/common';

import {
  EVENT_SINKS,
  type EventSink,
} from 'src/engine/core-modules/event-logs/ingest/event-sink';
import {
  WORKSPACE_EVENTS_JOB_NAME,
  type WorkspaceEventEnvelope,
  type WorkspaceEventsJobData,
} from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventLiveService } from 'src/engine/subscriptions/workspace-event-live.service';

// The unified event pipeline. enqueue() propagates queue errors so producers decide how to
// handle them; ingest() throws on persistence failure so the consumer job retries.
@Injectable()
export class WorkspaceEventSinkService {
  constructor(
    @Inject(EVENT_SINKS)
    private readonly sinks: EventSink[],
    @InjectMessageQueue(MessageQueue.workspaceEventsQueue)
    private readonly workspaceEventsQueueService: MessageQueueService,
    private readonly workspaceEventLiveService: WorkspaceEventLiveService,
  ) {}

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
    // persist() throws so the job retries. publishWatched() is awaited but swallows its own
    // errors, so a live-fan-out failure never retries the job (which would double-write).
    await this.persist(events);
    await this.workspaceEventLiveService.publishWatched(events);
  }

  private async persist(events: WorkspaceEventEnvelope[]): Promise<void> {
    await Promise.all(this.sinks.map((sink) => sink.write(events)));
  }
}
