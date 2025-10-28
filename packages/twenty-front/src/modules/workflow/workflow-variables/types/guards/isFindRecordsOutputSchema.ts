import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { type FindRecordsOutputSchema } from '@/workflow/workflow-variables/types/FindRecordsOutputSchema';
import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';

export const isFindRecordsOutputSchema = (
  stepType: WorkflowActionType | WorkflowTriggerType,
  schema: OutputSchemaV2,
): schema is FindRecordsOutputSchema => {
  return stepType === 'FIND_RECORDS';
};
