import { useWorkflowEditorMutationErrorHandler } from '@/workflow/hooks/useWorkflowEditorMutationErrorHandler';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
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

  const { markStepForRecomputation } = useStepsOutputSchema();

  const updateWorkflowVersionTrigger = async ({
    workflowVersionId,
    trigger,
  }: {
    workflowVersionId: string;
    trigger: WorkflowTrigger;
  }) => {
    const { data } = await mutateCore({
      variables: {
        input: {
          coreWorkflowVersionId: workflowVersionId,
          trigger,
        },
      },
    });

    if (!isDefined(data?.updateWorkflowVersionTrigger)) {
      return false;
    }

    markStepForRecomputation({
      stepId: TRIGGER_STEP_ID,
      workflowVersionId,
    });

    await invalidateCoreWorkflowVersions(apolloCoreClient);

    return true;
  };

  return { updateWorkflowVersionTrigger };
};
