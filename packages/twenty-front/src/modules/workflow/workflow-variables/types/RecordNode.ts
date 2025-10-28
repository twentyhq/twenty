import { type RecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';

export type RecordNode = {
  isLeaf: false;
  label: string;
  value: RecordOutputSchemaV2;
};
