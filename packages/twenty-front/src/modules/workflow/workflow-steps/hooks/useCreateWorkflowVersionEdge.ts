import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { useMutation } from '@apollo/client';
import {
  type CreateWorkflowVersionEdgeMutation,
  type CreateWorkflowVersionEdgeMutationVariables,
  type CreateWorkflowVersionEdgeInput,
} from '~/generated/graphql';
import { CREATE_WORKFLOW_VERSION_EDGE } from '@/workflow/graphql/mutations/createWorkflowVersionEdge';
import { useUpdateWorkflowVersionCache } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionCache';

export const useCreateWorkflowVersionEdge = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { updateWorkflowVersionCache } = useUpdateWorkflowVersionCache();

  const { findOneRecordQuery: findOneWorkflowVersionQuery } =
    useFindOneRecordQuery({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const [mutate] = useMutation<
    CreateWorkflowVersionEdgeMutation,
    CreateWorkflowVersionEdgeMutationVariables
  >(CREATE_WORKFLOW_VERSION_EDGE, { client: apolloCoreClient });

  const createWorkflowVersionEdge = async (
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

    const workflowVersionStepChanges = result?.data?.createWorkflowVersionEdge;

    updateWorkflowVersionCache({
      workflowVersionStepChanges,
      workflowVersionId: input.workflowVersionId,
    });

    return result;
  };

  return { createWorkflowVersionEdge };
};
