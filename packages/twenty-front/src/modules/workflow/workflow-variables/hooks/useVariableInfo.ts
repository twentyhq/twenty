import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import {
  type RecordOutputSchema,
  type StepOutputSchema,
} from '@/workflow/workflow-variables/types/StepOutputSchema';
import { searchVariableThroughOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughOutputSchema';
import { searchVariableThroughRecordOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughRecordOutputSchema';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

export const useVariableInfo = ({
  stepOutputSchema,
  rawVariableName,
  isFullRecord,
}: {
  stepOutputSchema: StepOutputSchema | undefined;
  rawVariableName: string;
  isFullRecord: boolean;
}) => {
  const flow = useFlowOrThrow();

  if (!isDefined(stepOutputSchema)) {
    return {
      variableInfo: undefined,
    };
  }

  const getStepType = (
    stepId: string,
  ): WorkflowActionType | WorkflowTriggerType | undefined => {
    if (stepId === TRIGGER_STEP_ID) {
      return flow.trigger?.type;
    }

    return flow.steps?.find((step) => step.id === stepId)?.type;
  };

  const getVariableInfo = () => {
    const stepId = stepOutputSchema.id;

    const stepType = getStepType(stepId);

    if (
      stepType === 'CREATE_RECORD' ||
      stepType === 'UPDATE_RECORD' ||
      stepType === 'DELETE_RECORD' ||
      stepType === 'MANUAL'
    ) {
      return searchVariableThroughRecordOutputSchema({
        recordOutputSchema: stepOutputSchema.outputSchema as RecordOutputSchema,
        rawVariableName,
      });
    }

    return searchVariableThroughOutputSchema({
      stepOutputSchema,
      rawVariableName,
      isFullRecord,
    });
  };

  const { fieldMetadataId, compositeFieldSubFieldName, label, pathLabel } =
    getVariableInfo();

  return {
    fieldMetadataId,
    compositeFieldSubFieldName,
    label,
    pathLabel,
  };
};
