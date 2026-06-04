import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';

// One destination for the unified event stream; peers (e.g. an S3 archive) can be added behind this.
export type EventSink = {
  write(events: WorkspaceEventEnvelope[]): Promise<void>;
};

export const EVENT_SINKS = Symbol('EVENT_SINKS');
