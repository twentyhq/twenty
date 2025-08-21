import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { useWorkflowVersionIdOrThrow } from '@/workflow/hooks/useWorkflowVersionIdOrThrow';
import { stepsOutputSchemaFamilySelector } from '@/workflow/states/selectors/stepsOutputSchemaFamilySelector';
import { type RecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { getOutputSchemaType } from '@/workflow/workflow-variables/utils/getOutputSchemaType';
import { searchVariableThroughOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughOutputSchema';
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

  // TODO: remove old search once all schema types are handled
  return searchVariableThroughOutputSchema({
    stepOutputSchema,
    rawVariableName,
    isFullRecord,
  });
};
