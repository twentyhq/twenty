import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/audit/types/workspace-event-envelope.type';

// A sink is one destination for the unified event stream. ClickHouse is the
// default and the only read store; a peer (e.g. S3 archive) can be added behind
// this interface without touching producers.
export type EventSink = {
  write(events: WorkspaceEventEnvelope[]): Promise<void>;
};

// Injection token for the ordered list of configured sinks (EventSink[]).
export const EVENT_SINKS = Symbol('EVENT_SINKS');
