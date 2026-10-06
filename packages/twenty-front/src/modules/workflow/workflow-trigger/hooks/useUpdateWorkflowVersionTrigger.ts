import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useWorkflowEditorMutationErrorHandler } from '@/workflow/hooks/useWorkflowEditorMutationErrorHandler';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';
import { UpdateCoreWorkflowVersionTriggerDocument } from '~/generated/graphql';

export const useUpdateWorkflowVersionTrigger = (instanceId?: string) => {
  const apolloCoreClient = useApolloCoreClient();
  const handleMutationError = useWorkflowEditorMutationErrorHandler(instanceId);
  const [mutate] = useMutation(UpdateCoreWorkflowVersionTriggerDocument, {
    client: apolloCoreClient,
    onError: handleMutationError,
  });

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow(instanceId);

  const { markStepForRecomputation } = useStepsOutputSchema();

  const setFlow = useSetAtomComponentState(flowComponentState, instanceId);

  const updateTrigger = async (updatedTrigger: WorkflowTrigger) => {
    const workflowVersionId = await getUpdatableWorkflowVersion();

    const { data } = await mutate({
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
