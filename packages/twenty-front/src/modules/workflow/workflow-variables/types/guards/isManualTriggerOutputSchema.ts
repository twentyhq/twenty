import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { type ManualTriggerOutputSchema } from '@/workflow/workflow-variables/types/ManualTriggerOutputSchema';
import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';

export const isManualTriggerOutputSchema = (
  stepType: WorkflowActionType | WorkflowTriggerType,
  _schema: OutputSchemaV2,
): _schema is ManualTriggerOutputSchema => {
  return stepType === 'MANUAL';
};
