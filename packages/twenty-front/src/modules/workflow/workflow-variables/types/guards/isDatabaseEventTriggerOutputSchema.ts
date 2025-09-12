import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { type DatabaseEventTriggerOutputSchema } from '@/workflow/workflow-variables/types/DatabaseEventTriggerOutputSchema';
import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';

export const isDatabaseEventTriggerOutputSchema = (
  stepType: WorkflowActionType | WorkflowTriggerType,
  schema: OutputSchemaV2,
): schema is DatabaseEventTriggerOutputSchema => {
  return stepType === 'DATABASE_EVENT';
};
