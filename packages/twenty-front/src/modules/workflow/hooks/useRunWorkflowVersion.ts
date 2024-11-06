import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { RUN_WORKFLOW_VERSION } from '@/workflow/graphql/mutations/runWorkflowVersion';
import { useMutation } from '@apollo/client';
import {
  RunWorkflowVersionMutation,
  RunWorkflowVersionMutationVariables,
} from '~/generated/graphql';

export const useRunWorkflowVersion = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const [mutate] = useMutation<
    RunWorkflowVersionMutation,
    RunWorkflowVersionMutationVariables
  >(RUN_WORKFLOW_VERSION, {
    client: apolloMetadataClient,
  });

  const runWorkflowVersion = async (
    workflowVersionId: string,
    payload?: Record<string, any>,
  ) => {
    await mutate({
      variables: { input: { workflowVersionId, payload } },
    });
  };

  return { runWorkflowVersion };
};
