import { useWorkflowEditorMutationErrorHandler } from '@/workflow/hooks/useWorkflowEditorMutationErrorHandler';
import { useSavePendingWorkflowFlow } from '@/workflow/hooks/useSavePendingWorkflowFlow';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useApplyWorkflowVersionStepChanges } from '@/workflow/workflow-steps/hooks/useApplyWorkflowVersionStepChanges';
import { useMutation } from '@apollo/client/react';
import {
  CreateCoreWorkflowVersionEdgeDocument,
  type CreateCoreWorkflowVersionEdgeInput,
} from '~/generated/graphql';

export type WorkflowVersionEdgeInput = Omit<
  CreateCoreWorkflowVersionEdgeInput,
  'coreWorkflowVersionId'
> & {
  workflowVersionId: string;
};

export const useCreateWorkflowVersionEdge = () => {
  const { savePendingWorkflowFlow } = useSavePendingWorkflowFlow();
  const apolloCoreClient = useApolloCoreClient();
  const handleCoreMutationError = useWorkflowEditorMutationErrorHandler();
  const [mutateCore] = useMutation(CreateCoreWorkflowVersionEdgeDocument, {
    client: apolloCoreClient,
    onError: handleCoreMutationError,
  });

  const { applyWorkflowVersionStepChanges } =
    useApplyWorkflowVersionStepChanges();

  const createWorkflowVersionEdge = async (input: WorkflowVersionEdgeInput) => {
    const { workflowVersionId, ...edgeInput } = input;
    await savePendingWorkflowFlow();

    const result = await mutateCore({
      variables: {
        input: { ...edgeInput, coreWorkflowVersionId: workflowVersionId },
      },
    });

    const workflowVersionStepChanges = result?.data?.createWorkflowVersionEdge;

    applyWorkflowVersionStepChanges({
      workflowVersionStepChanges,
      workflowVersionId,
    });

    await invalidateCoreWorkflowVersions(apolloCoreClient);

    return result;
  };

  return { createWorkflowVersionEdge };
};
