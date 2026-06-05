import { Inject, Injectable } from '@nestjs/common';

import {
  EVENT_SINKS,
  type EventSink,
} from 'src/engine/core-modules/event-logs/ingest/event-sink';
import { EventLogLiveService } from 'src/engine/core-modules/event-logs/live/event-log-live.service';
import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';

// Sink layer: persist to the configured sinks and fan out to live subscribers. ingest() throws on
// persistence failure so the (best-effort) caller can log it.
@Injectable()
export class WorkspaceEventSinkService {
  constructor(
    @Inject(EVENT_SINKS)
    private readonly sinks: EventSink[],
    private readonly workspaceEventLiveService: EventLogLiveService,
  ) {}

  isEnabled(): boolean {
    return this.sinks.length > 0;
  }

  async ingest(events: WorkspaceEventEnvelope[]): Promise<void> {
    // persist() throws on failure so the (best-effort) caller logs it. publishWatched() swallows
    // its own errors, so a live-fan-out failure never affects persistence.
    await this.persist(events);
    await this.workspaceEventLiveService.publishWatched(events);
  }

  private async persist(events: WorkspaceEventEnvelope[]): Promise<void> {
    await Promise.all(this.sinks.map((sink) => sink.write(events)));
  }
}
