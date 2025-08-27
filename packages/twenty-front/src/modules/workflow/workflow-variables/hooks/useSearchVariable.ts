import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { useWorkflowVersionIdOrThrow } from '@/workflow/hooks/useWorkflowVersionIdOrThrow';
import { stepsOutputSchemaFamilySelector } from '@/workflow/states/selectors/stepsOutputSchemaFamilySelector';
import type { BaseOutputSchemaV2 } from '@/workflow/workflow-variables/types/BaseOutputSchemaV2';
import type { CodeOutputSchema } from '@/workflow/workflow-variables/types/CodeOutputSchema';
import type { FindRecordsOutputSchema } from '@/workflow/workflow-variables/types/FindRecordsOutputSchema';
import type { FormOutputSchema } from '@/workflow/workflow-variables/types/FormOutputSchema';
import { type RecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { getOutputSchemaType } from '@/workflow/workflow-variables/utils/getOutputSchemaType';
import { searchVariableThroughBaseOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughBaseOutputSchema';
import { searchVariableThroughCodeOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughCodeOutputSchema';
import { searchVariableThroughFindRecordsOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughFindRecordsOutputSchema';
import { searchVariableThroughFormOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughFormOutputSchema';
import { searchVariableThroughRecordEventOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughRecordEventOutputSchema';
import { searchVariableThroughRecordOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughRecordOutputSchema';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

export type VariableSearchResult = {
  variableLabel: string | undefined;
  variablePathLabel: string | undefined;
  variableType?: string;
  fieldMetadataId?: string;
  compositeFieldSubFieldName?: string;
};

export const useSearchVariable = ({
  stepId,
  rawVariableName,
  isFullRecord,
}: {
  stepId: string;
  rawVariableName: string;
  isFullRecord: boolean;
}): VariableSearchResult => {
  const workflowVersionId = useWorkflowVersionIdOrThrow();
  const flow = useFlowOrThrow();
  const [stepOutputSchema] = useRecoilValue(
    stepsOutputSchemaFamilySelector({
      workflowVersionId,
      stepIds: [stepId],
    }),
  );

  if (!isDefined(stepOutputSchema)) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
    };
  }

  const stepType =
    stepId === TRIGGER_STEP_ID
      ? flow.trigger?.type
      : flow.steps?.find((step) => step.id === stepId)?.type;

  if (!isDefined(stepType)) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
    };
  }

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
