import { type RecordNode } from '@/workflow/workflow-variables/types/RecordNode';
import type { Leaf } from 'twenty-shared/workflow';

export type WaitForEventOutputSchema = {
  record: RecordNode;
  recordId: Leaf;
  before?: RecordNode;
  updatedFields?: Leaf;
  hasTimedOut: Leaf;
};
