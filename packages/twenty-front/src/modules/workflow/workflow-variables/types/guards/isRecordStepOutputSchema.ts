import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { type RecordActionOutputSchema } from '@/workflow/workflow-variables/types/RecordActionOutputSchema';
import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';

const RECORD_STEP_TYPES = [
  'CREATE_RECORD',
  'UPDATE_RECORD',
  'DELETE_RECORD',
  'UPSERT_RECORD',
];

export const isRecordStepOutputSchema = (
  stepType: WorkflowActionType | WorkflowTriggerType,
  schema: OutputSchemaV2,
): schema is RecordActionOutputSchema => {
  return RECORD_STEP_TYPES.includes(stepType);
};
