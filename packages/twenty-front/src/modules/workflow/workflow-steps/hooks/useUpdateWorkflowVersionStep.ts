import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useWorkflowEditorMutationErrorHandler } from '@/workflow/hooks/useWorkflowEditorMutationErrorHandler';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';
import {
  UpdateCoreWorkflowVersionStepDocument,
  type UpdateCoreWorkflowVersionStepInput,
} from '~/generated/graphql';

type UpdateWorkflowVersionStepInput = Omit<
  UpdateCoreWorkflowVersionStepInput,
  'coreWorkflowVersionId'
> & {
  workflowVersionId: string;
};

export const useUpdateWorkflowVersionStep = (instanceId?: string) => {
  const apolloCoreClient = useApolloCoreClient();
  const handleMutationError = useWorkflowEditorMutationErrorHandler(instanceId);
  const [mutate] = useMutation(UpdateCoreWorkflowVersionStepDocument, {
    client: apolloCoreClient,
    onError: handleMutationError,
  });
  const { markStepForRecomputation } = useStepsOutputSchema();
  const setFlow = useSetAtomComponentState(flowComponentState, instanceId);

  const updateWorkflowVersionStep = async (
    input: UpdateWorkflowVersionStepInput,
  ) => {
    const { workflowVersionId, ...stepInput } = input;
    const result = await mutate({
      variables: {
        input: { ...stepInput, coreWorkflowVersionId: workflowVersionId },
      },
    });
    const updatedStep = result?.data?.updateWorkflowVersionStep;
    if (!isDefined(updatedStep)) {
      return;
    }

    markStepForRecomputation({
      stepId: updatedStep.id,
      workflowVersionId,
    });

    setFlow((currentFlow) => {
      if (!isDefined(currentFlow)) {
        return currentFlow;
      }

      return {
        ...currentFlow,
        workflowVersionId,
        steps: (currentFlow.steps ?? []).map((step) =>
          step.id === updatedStep.id ? updatedStep : step,
        ),
      };
    });

    await invalidateCoreWorkflowVersions(apolloCoreClient);

    return result;
  };

  return { updateWorkflowVersionStep };
};
