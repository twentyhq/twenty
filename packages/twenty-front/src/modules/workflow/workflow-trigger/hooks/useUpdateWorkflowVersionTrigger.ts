import { useWorkflowEditorMutationErrorHandler } from '@/workflow/hooks/useWorkflowEditorMutationErrorHandler';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';
import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { UpdateCoreWorkflowVersionTriggerDocument } from '~/generated/graphql';

export const useUpdateWorkflowVersionTrigger = (instanceId?: string) => {
  const apolloCoreClient = useApolloCoreClient();
  const handleCoreMutationError =
    useWorkflowEditorMutationErrorHandler(instanceId);
  const [mutateCore] = useMutation(UpdateCoreWorkflowVersionTriggerDocument, {
    client: apolloCoreClient,
    onError: handleCoreMutationError,
  });

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow(instanceId);

  const { markStepForRecomputation } = useStepsOutputSchema();

  const setFlow = useSetAtomComponentState(flowComponentState, instanceId);

  const updateTrigger = async (updatedTrigger: WorkflowTrigger) => {
    const workflowVersionId = await getUpdatableWorkflowVersion();

    const { data } = await mutateCore({
      variables: {
        input: {
          coreWorkflowVersionId: workflowVersionId,
          trigger: updatedTrigger,
        },
      },
    });

    if (!isDefined(data?.updateWorkflowVersionTrigger)) {
      return;
    }

    markStepForRecomputation({
      stepId: TRIGGER_STEP_ID,
      workflowVersionId,
    });

    setFlow((currentFlow) => {
      if (!isDefined(currentFlow)) {
        return currentFlow;
      }

      return { ...currentFlow, workflowVersionId, trigger: updatedTrigger };
    });

    await invalidateCoreWorkflowVersions(apolloCoreClient);
  };

  return {
    updateTrigger,
  };
};
