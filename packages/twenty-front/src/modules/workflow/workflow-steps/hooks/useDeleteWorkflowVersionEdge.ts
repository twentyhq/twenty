import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { useMutation } from '@apollo/client';
import {
  type CreateWorkflowVersionEdgeInput,
  type DeleteWorkflowVersionEdgeMutation,
  type DeleteWorkflowVersionEdgeMutationVariables,
} from '~/generated/graphql';
import { DELETE_WORKFLOW_VERSION_EDGE } from '@/workflow/graphql/mutations/deleteWorkflowVersionEdge';
import { useUpdateWorkflowVersionCache } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionCache';

export const useDeleteWorkflowVersionEdge = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { updateWorkflowVersionCache } = useUpdateWorkflowVersionCache();

  const { findOneRecordQuery: findOneWorkflowVersionQuery } =
    useFindOneRecordQuery({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const [mutate] = useMutation<
    DeleteWorkflowVersionEdgeMutation,
    DeleteWorkflowVersionEdgeMutationVariables
  >(DELETE_WORKFLOW_VERSION_EDGE, { client: apolloCoreClient });

  const deleteWorkflowVersionEdge = async (
    input: CreateWorkflowVersionEdgeInput,
  ) => {
    const result = await mutate({
      variables: { input },
      refetchQueries: [
        {
          query: findOneWorkflowVersionQuery,
          variables: { objectRecordId: input.workflowVersionId },
        },
      ],
    });

    const workflowVersionStepChanges = result?.data?.deleteWorkflowVersionEdge;

    updateWorkflowVersionCache({
      workflowVersionStepChanges,
      workflowVersionId: input.workflowVersionId,
    });

    return result;
  };

  return { deleteWorkflowVersionEdge };
};
