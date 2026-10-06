import { useMutation } from '@apollo/client/react';

import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useWorkflowEditorMutationErrorHandler } from '@/workflow/hooks/useWorkflowEditorMutationErrorHandler';
import { useApplyWorkflowVersionStepChanges } from '@/workflow/workflow-steps/hooks/useApplyWorkflowVersionStepChanges';
import {
  DeleteCoreWorkflowVersionEdgeDocument,
  type DeleteCoreWorkflowVersionEdgeInput,
} from '~/generated/graphql';

type DeleteWorkflowVersionEdgeInput = Omit<
  DeleteCoreWorkflowVersionEdgeInput,
  'coreWorkflowVersionId'
> & {
  workflowVersionId: string;
};

export const useDeleteWorkflowVersionEdge = () => {
  const apolloCoreClient = useApolloCoreClient();
  const handleMutationError = useWorkflowEditorMutationErrorHandler();
  const [mutate] = useMutation(DeleteCoreWorkflowVersionEdgeDocument, {
    client: apolloCoreClient,
    onError: handleMutationError,
  });

  const { applyWorkflowVersionStepChanges } =
    useApplyWorkflowVersionStepChanges();

  const deleteWorkflowVersionEdge = async (
    input: DeleteWorkflowVersionEdgeInput,
  ) => {
    const { workflowVersionId, ...stepInput } = input;
    const result = await mutate({
      variables: {
        input: { ...stepInput, coreWorkflowVersionId: workflowVersionId },
      },
    });

    const workflowVersionStepChanges = result?.data?.deleteWorkflowVersionEdge;

    applyWorkflowVersionStepChanges({
      workflowVersionStepChanges,
      workflowVersionId,
    });

    await invalidateCoreWorkflowVersions(apolloCoreClient);

    return result;
  };

  return { deleteWorkflowVersionEdge };
};
