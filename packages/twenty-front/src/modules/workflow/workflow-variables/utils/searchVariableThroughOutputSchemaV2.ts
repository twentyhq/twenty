import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { type BaseOutputSchemaV2 } from '@/workflow/workflow-variables/types/BaseOutputSchemaV2';
import { type CodeOutputSchema } from '@/workflow/workflow-variables/types/CodeOutputSchema';
import { type FindRecordsOutputSchema } from '@/workflow/workflow-variables/types/FindRecordsOutputSchema';
import { type FormOutputSchema } from '@/workflow/workflow-variables/types/FormOutputSchema';
import { type RecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { getOutputSchemaType } from '@/workflow/workflow-variables/utils/getOutputSchemaType';
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
  const outputSchemaType = getOutputSchemaType(stepType);

  if (outputSchemaType === 'RECORD') {
    return searchVariableThroughRecordOutputSchema({
      stepName: stepOutputSchema.name,
      recordOutputSchema: stepOutputSchema.outputSchema as RecordOutputSchemaV2,
      rawVariableName,
      isFullRecord,
    });
  }

  if (outputSchemaType === 'DATABASE_EVENT') {
    return searchVariableThroughRecordEventOutputSchema({
      stepName: stepOutputSchema.name,
      recordOutputSchema: stepOutputSchema.outputSchema as RecordOutputSchemaV2,
      rawVariableName,
      isFullRecord,
    });
  }

  if (outputSchemaType === 'FIND_RECORDS') {
    return searchVariableThroughFindRecordsOutputSchema({
      stepName: stepOutputSchema.name,
      searchRecordOutputSchema:
        stepOutputSchema.outputSchema as unknown as FindRecordsOutputSchema,
      rawVariableName,
      isFullRecord,
    });
  }

  if (outputSchemaType === 'FORM') {
    return searchVariableThroughFormOutputSchema({
      stepName: stepOutputSchema.name,
      formOutputSchema:
        stepOutputSchema.outputSchema as unknown as FormOutputSchema,
      rawVariableName,
      isFullRecord,
    });
  }

  if (outputSchemaType === 'CODE') {
    return searchVariableThroughCodeOutputSchema({
      stepName: stepOutputSchema.name,
      codeOutputSchema:
        stepOutputSchema.outputSchema as unknown as CodeOutputSchema,
      rawVariableName,
      isFullRecord,
    });
  }

  return searchVariableThroughBaseOutputSchema({
    stepName: stepOutputSchema.name,
    baseOutputSchema: stepOutputSchema.outputSchema as BaseOutputSchemaV2,
    rawVariableName,
    isFullRecord,
  });
};
