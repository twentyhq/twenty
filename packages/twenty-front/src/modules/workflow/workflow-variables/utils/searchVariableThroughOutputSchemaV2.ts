import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { isCodeOutputSchema } from '@/workflow/workflow-variables/types/guards/isCodeOutputSchema';
import { isDatabaseEventTriggerOutputSchema } from '@/workflow/workflow-variables/types/guards/isDatabaseEventTriggerOutputSchema';
import { isFindRecordsOutputSchema } from '@/workflow/workflow-variables/types/guards/isFindRecordsOutputSchema';
import { isFormOutputSchema } from '@/workflow/workflow-variables/types/guards/isFormOutputSchema';
import { isRecordStepOutputSchema } from '@/workflow/workflow-variables/types/guards/isRecordStepOutputSchema';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';

import { searchVariableThroughBaseOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughBaseOutputSchema';
import { searchVariableThroughCodeOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughCodeOutputSchema';
import { searchVariableThroughFindRecordsOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughFindRecordsOutputSchema';
import { searchVariableThroughFormOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughFormOutputSchema';
import { searchVariableThroughRecordEventOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughRecordEventOutputSchema';
import { searchVariableThroughRecordOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughRecordOutputSchema';

export const searchVariableThroughOutputSchemaV2 = ({
  stepOutputSchema,
  stepType,
  rawVariableName,
  isFullRecord,
}: {
  stepOutputSchema: StepOutputSchemaV2;
  stepType: WorkflowTriggerType | WorkflowActionType;
  rawVariableName: string;
  isFullRecord: boolean;
}) => {
  if (isRecordStepOutputSchema(stepType, stepOutputSchema.outputSchema)) {
    return searchVariableThroughRecordOutputSchema({
      stepName: stepOutputSchema.name,
      recordOutputSchema: stepOutputSchema.outputSchema,
      rawVariableName,
      isFullRecord,
    });
  }

  if (
    isDatabaseEventTriggerOutputSchema(stepType, stepOutputSchema.outputSchema)
  ) {
    return searchVariableThroughRecordEventOutputSchema({
      stepName: stepOutputSchema.name,
      recordOutputSchema: stepOutputSchema.outputSchema,
      rawVariableName,
      isFullRecord,
    });
  }

  if (isFindRecordsOutputSchema(stepType, stepOutputSchema.outputSchema)) {
    return searchVariableThroughFindRecordsOutputSchema({
      stepName: stepOutputSchema.name,
      searchRecordOutputSchema: stepOutputSchema.outputSchema,
      rawVariableName,
      isFullRecord,
    });
  }

  if (isFormOutputSchema(stepType, stepOutputSchema.outputSchema)) {
    return searchVariableThroughFormOutputSchema({
      stepName: stepOutputSchema.name,
      formOutputSchema: stepOutputSchema.outputSchema,
      rawVariableName,
      isFullRecord,
    });
  }

  if (isCodeOutputSchema(stepType, stepOutputSchema.outputSchema)) {
    return searchVariableThroughCodeOutputSchema({
      stepName: stepOutputSchema.name,
      codeOutputSchema: stepOutputSchema.outputSchema,
      rawVariableName,
      isFullRecord,
    });
  }

  return searchVariableThroughBaseOutputSchema({
    stepName: stepOutputSchema.name,
    baseOutputSchema: stepOutputSchema.outputSchema,
    rawVariableName,
    isFullRecord,
  });
};
