import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';

export type EventSink = {
  write(events: WorkspaceEventEnvelope[]): Promise<void>;
};

export const EVENT_SINKS = Symbol('EVENT_SINKS');
