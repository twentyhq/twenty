import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { type CodeOutputSchema } from '@/workflow/workflow-variables/types/CodeOutputSchema';
import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';

export const isCodeOutputSchema = (
  stepType: WorkflowActionType | WorkflowTriggerType,
  schema: OutputSchemaV2,
): schema is CodeOutputSchema => {
  return stepType === 'CODE';
};
