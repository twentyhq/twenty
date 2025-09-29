import { type RecordNode } from '@/workflow/workflow-variables/types/RecordNode';

export type FindRecordsOutputSchema = {
  first: RecordNode;
  last: RecordNode;
  totalCount: number;
};
