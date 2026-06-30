import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { type ManualTriggerOutputSchema } from 'twenty-shared/workflow';

export const isManualTriggerOutputSchema = (
  stepType: WorkflowActionType | WorkflowTriggerType,
  _schema: OutputSchemaV2,
): _schema is ManualTriggerOutputSchema => {
  return stepType === 'MANUAL';
};
