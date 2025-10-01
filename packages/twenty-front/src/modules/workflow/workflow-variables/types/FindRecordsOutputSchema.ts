import type { Leaf } from '@/workflow/workflow-variables/types/BaseOutputSchemaV2';
import { type RecordNode } from '@/workflow/workflow-variables/types/RecordNode';

export type FindRecordsOutputSchema = {
  first: RecordNode;
  all: Leaf | undefined;
  totalCount: Leaf;
};
