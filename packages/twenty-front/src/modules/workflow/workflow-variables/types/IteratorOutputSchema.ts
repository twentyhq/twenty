import { type RecordNode } from '@/workflow/workflow-variables/types/RecordNode';
import { type Leaf } from 'twenty-shared/workflow';

export type IteratorOutputSchema = {
  // TODO(t.trompette): add support for node items that are not records
  currentItem: RecordNode | Leaf;
  currentItemIndex: number;
  hasProcessedAllItems: boolean;
};
