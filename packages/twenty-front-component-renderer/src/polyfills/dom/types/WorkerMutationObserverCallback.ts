import { type WorkerMutationObserver } from '@/polyfills/dom/types/WorkerMutationObserver';
import { type WorkerMutationRecord } from '@/polyfills/dom/types/WorkerMutationRecord';

export type WorkerMutationObserverCallback = (
  records: WorkerMutationRecord[],
  observer: WorkerMutationObserver,
) => void;
