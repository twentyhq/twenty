import { type WorkerNodeList } from '@/polyfills/dom/types/WorkerNodeList';

export type WorkerMutationRecord = {
  type: MutationRecordType;
  target: Node;
  addedNodes: WorkerNodeList;
  removedNodes: WorkerNodeList;
  previousSibling: Node | null;
  nextSibling: Node | null;
  attributeName: string | null;
  attributeNamespace: string | null;
  oldValue: string | null;
};
