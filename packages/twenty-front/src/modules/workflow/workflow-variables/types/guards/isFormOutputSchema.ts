import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { type FormOutputSchema } from '@/workflow/workflow-variables/types/FormOutputSchema';
import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';

export const isFormOutputSchema = (
  stepType: WorkflowActionType | WorkflowTriggerType,
  schema: OutputSchemaV2,
): schema is FormOutputSchema => {
  return stepType === 'FORM';
};
