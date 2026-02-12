import { type RecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';

export type RecordNode = {
  isLeaf: false;
  icon?: string;
  label: string;
  value: RecordOutputSchemaV2;
};
