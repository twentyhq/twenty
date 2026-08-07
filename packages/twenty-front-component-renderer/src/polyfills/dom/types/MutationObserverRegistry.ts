import { type MutationRecordSink } from '@/polyfills/dom/types/MutationRecordSink';
import { type WorkerMutationRecord } from '@/polyfills/dom/types/WorkerMutationRecord';

export type MutationObserverRegistry = {
  registerObservation: (input: {
    target: Node;
    sink: MutationRecordSink;
    options: MutationObserverInit;
  }) => void;
  unregisterObservations: (input: {
    targets: Iterable<Node>;
    sink: MutationRecordSink;
  }) => void;
  registerTransientObservations: (input: {
    detachedNode: Node;
    formerParent: Node;
  }) => void;
  clearTransientObservations: (input: { sink: MutationRecordSink }) => void;
  broadcastMutationRecord: (input: {
    record: WorkerMutationRecord;
    oldValue: string | null;
  }) => void;
};
