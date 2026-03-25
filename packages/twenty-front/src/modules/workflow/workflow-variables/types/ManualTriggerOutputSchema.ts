import { type RecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';

export type ManualTriggerOutputSchema =
  | BaseOutputSchemaV2
  | RecordOutputSchemaV2;
