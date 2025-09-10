import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { type BaseOutputSchemaV2 } from '@/workflow/workflow-variables/types/BaseOutputSchemaV2';
import { type CodeOutputSchema } from '@/workflow/workflow-variables/types/CodeOutputSchema';
import { type FindRecordsOutputSchema } from '@/workflow/workflow-variables/types/FindRecordsOutputSchema';
import { type FormOutputSchema } from '@/workflow/workflow-variables/types/FormOutputSchema';
import { type RecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';

export type OutputSchemaV2 =
  | BaseOutputSchemaV2
  | CodeOutputSchema
  | FindRecordsOutputSchema
  | FormOutputSchema
  | RecordOutputSchemaV2;

export type StepOutputSchemaV2 = {
  id: string;
  name: string;
  type: WorkflowTriggerType | WorkflowActionType;
  icon?: string;
  outputSchema: OutputSchemaV2;
};
