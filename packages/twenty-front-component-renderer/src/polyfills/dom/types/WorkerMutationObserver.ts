import { type WorkerMutationRecord } from '@/polyfills/dom/types/WorkerMutationRecord';

export type WorkerMutationObserver = {
  observe: (target: Node, options?: MutationObserverInit) => void;
  disconnect: () => void;
  takeRecords: () => WorkerMutationRecord[];
};
