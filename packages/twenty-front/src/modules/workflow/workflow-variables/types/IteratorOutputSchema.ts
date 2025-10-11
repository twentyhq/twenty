import { type Leaf } from '@/workflow/workflow-variables/types/BaseOutputSchemaV2';
import { type RecordNode } from '@/workflow/workflow-variables/types/RecordNode';

export type IteratorOutputSchema = {
  // TODO(t.trompette): add support for node items that are not records
  currentItem: RecordNode | Leaf;
  currentItemIndex: number;
  hasProcessedAllItems: boolean;
};
