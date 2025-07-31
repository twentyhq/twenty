import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useMutation } from '@apollo/client';
import {
  CreateWorkflowVersionEdgeMutation,
  CreateWorkflowVersionEdgeMutationVariables,
} from '~/generated-metadata/graphql';
import { CREATE_WORKFLOW_VERSION_EDGE } from '@/workflow/graphql/mutations/createWorkflowVersionEdge';
import { CreateWorkflowVersionEdgeInput } from '~/generated/graphql';
import { useWorkflowVersionStepUpdateCache } from '@/workflow/workflow-steps/hooks/useWorkflowVersionStepUpdateCache';

export const useCreateWorkflowVersionEdge = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { updateCache } = useWorkflowVersionStepUpdateCache();

  const [mutate] = useMutation<
    CreateWorkflowVersionEdgeMutation,
    CreateWorkflowVersionEdgeMutationVariables
  >(CREATE_WORKFLOW_VERSION_EDGE, { client: apolloCoreClient });

  const createWorkflowVersionEdge = async (
    input: CreateWorkflowVersionEdgeInput,
  ) => {
    const result = await mutate({ variables: { input } });

    const workflowVersionStepUpdates = result?.data?.createWorkflowVersionEdge;

    updateCache({
      workflowVersionStepUpdates,
      workflowVersionId: input.workflowVersionId,
    });

    return result;
  };

  return { createWorkflowVersionEdge };
};
