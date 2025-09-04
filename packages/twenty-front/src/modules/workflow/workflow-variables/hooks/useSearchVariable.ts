import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { useWorkflowVersionIdOrThrow } from '@/workflow/hooks/useWorkflowVersionIdOrThrow';
import { stepsOutputSchemaFamilySelector } from '@/workflow/states/selectors/stepsOutputSchemaFamilySelector';
import { searchVariableThroughOutputSchemaV2 } from '@/workflow/workflow-variables/utils/searchVariableThroughOutputSchemaV2';
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

  return searchVariableThroughOutputSchemaV2({
    stepOutputSchema,
    stepType,
    rawVariableName,
    isFullRecord,
  });
};
