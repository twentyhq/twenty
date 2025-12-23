import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { type IteratorOutputSchema } from '@/workflow/workflow-variables/types/IteratorOutputSchema';

export const isIteratorOutputSchema = (
  stepType: WorkflowActionType | WorkflowTriggerType,
  schema: OutputSchemaV2,
): schema is IteratorOutputSchema => {
  return stepType === 'ITERATOR';
};
