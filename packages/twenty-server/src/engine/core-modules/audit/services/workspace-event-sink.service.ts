import { Inject, Injectable } from '@nestjs/common';

import {
  EVENT_SINKS,
  type EventSink,
} from 'src/engine/core-modules/audit/sinks/event-sink';
import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/audit/types/workspace-event-envelope.type';

// Single write entry point for the unified event pipeline: fans a batch out to
// every configured sink (ClickHouse by default). The consumer calls this.
@Injectable()
export class WorkspaceEventSinkService {
  constructor(
    @Inject(EVENT_SINKS)
    private readonly sinks: EventSink[],
  ) {}

  async write(events: WorkspaceEventEnvelope[]): Promise<void> {
    await Promise.all(this.sinks.map((sink) => sink.write(events)));
  }

  // Whether any sink is configured. Producers skip building/enqueuing events
  // when nothing is listening.
  isEnabled(): boolean {
    return this.sinks.length > 0;
  }
}
