import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import {
  DeleteCoreWorkflowVersionEdgeDocument,
  type CreateWorkflowVersionEdgeInput,
  type DeleteWorkflowVersionEdgeMutation,
  type DeleteWorkflowVersionEdgeMutationVariables,
} from '~/generated/graphql';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useMutation } from '@apollo/client/react';
import { DELETE_WORKFLOW_VERSION_EDGE } from '@/workflow/graphql/mutations/deleteWorkflowVersionEdge';
import { useApplyWorkflowVersionStepChanges } from '@/workflow/workflow-steps/hooks/useApplyWorkflowVersionStepChanges';

export const useDeleteWorkflowVersionEdge = () => {
  const apolloCoreClient = useApolloCoreClient();
  const isCore = useIsWorkflowCoreEnabled();
  const [mutateCore] = useMutation(DeleteCoreWorkflowVersionEdgeDocument, {
    client: apolloCoreClient,
  });

  const { applyWorkflowVersionStepChanges } =
    useApplyWorkflowVersionStepChanges();

  const [mutate] = useMutation<
    DeleteWorkflowVersionEdgeMutation,
    DeleteWorkflowVersionEdgeMutationVariables
  >(DELETE_WORKFLOW_VERSION_EDGE, { client: apolloCoreClient });

  const deleteWorkflowVersionEdge = async (
    input: CreateWorkflowVersionEdgeInput,
  ) => {
    const { workflowVersionId, ...stepInput } = input;
    const result = isCore
      ? await mutateCore({
          variables: {
            input: { ...stepInput, coreWorkflowVersionId: workflowVersionId },
          },
        })
      : await mutate({ variables: { input } });

    const workflowVersionStepChanges = result?.data?.deleteWorkflowVersionEdge;

    applyWorkflowVersionStepChanges({
      workflowVersionStepChanges,
      workflowVersionId: input.workflowVersionId,
    });

    if (isCore) {
      await invalidateCoreWorkflowVersions(apolloCoreClient);
    }

    return result;
  };

  return { deleteWorkflowVersionEdge };
};
