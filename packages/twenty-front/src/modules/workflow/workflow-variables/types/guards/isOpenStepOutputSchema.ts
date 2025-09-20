import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { type OpenStepOutputSchema } from '@/workflow/workflow-variables/types/OpenStepOutputSchema';
import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';

import { isCodeOutputSchema } from './isCodeOutputSchema';
import { isDatabaseEventTriggerOutputSchema } from './isDatabaseEventTriggerOutputSchema';
import { isFindRecordsOutputSchema } from './isFindRecordsOutputSchema';
import { isFormOutputSchema } from './isFormOutputSchema';
import { isRecordStepOutputSchema } from './isRecordStepOutputSchema';

export const isOpenStepOutputSchema = (
  stepType: WorkflowActionType | WorkflowTriggerType,
  schema: OutputSchemaV2,
): schema is OpenStepOutputSchema => {
  return (
    !isRecordStepOutputSchema(stepType, schema) &&
    !isDatabaseEventTriggerOutputSchema(stepType, schema) &&
    !isFindRecordsOutputSchema(stepType, schema) &&
    !isFormOutputSchema(stepType, schema) &&
    !isCodeOutputSchema(stepType, schema)
  );
};
