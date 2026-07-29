import { type WorkerMutationRecord } from '@/polyfills/dom/types/WorkerMutationRecord';

type CreateMutationRecordInput = {
  type: MutationRecordType;
  target: Node;
  addedNodes?: Node[];
  removedNodes?: Node[];
  previousSibling?: Node | null;
  nextSibling?: Node | null;
  attributeName?: string | null;
  attributeNamespace?: string | null;
};

export const createMutationRecord = ({
  type,
  target,
  addedNodes,
  removedNodes,
  previousSibling,
  nextSibling,
  attributeName,
  attributeNamespace,
}: CreateMutationRecordInput): WorkerMutationRecord => ({
  type,
  target,
  addedNodes: addedNodes ?? [],
  removedNodes: removedNodes ?? [],
  previousSibling: previousSibling ?? null,
  nextSibling: nextSibling ?? null,
  attributeName: attributeName ?? null,
  attributeNamespace: attributeNamespace ?? null,
  oldValue: null,
});
