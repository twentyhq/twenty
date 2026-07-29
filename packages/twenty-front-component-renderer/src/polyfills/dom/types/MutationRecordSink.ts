import { type WorkerMutationRecord } from '@/polyfills/dom/types/WorkerMutationRecord';

export type MutationRecordSink = {
  enqueueMutationRecord: (record: WorkerMutationRecord) => void;
};
