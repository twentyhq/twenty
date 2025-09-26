import { type BaseOutputSchemaV2 } from '@/workflow/workflow-variables/types/BaseOutputSchemaV2';
import { type RecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';

export type ManualTriggerOutputSchema =
  | BaseOutputSchemaV2
  | RecordOutputSchemaV2;
