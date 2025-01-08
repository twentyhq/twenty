import { useApolloClient } from '@apollo/client';
import {
  CreateDraftFromWorkflowVersionInput,
  useCreateDraftFromWorkflowVersionMutation,
} from '~/generated/graphql';

export const useCreateDraftFromWorkflowVersion = () => {
  const apolloClient = useApolloClient();

  const [mutate] = useCreateDraftFromWorkflowVersionMutation({
    client: apolloClient,
  });

  const createDraftFromWorkflowVersion = async (
    input: CreateDraftFromWorkflowVersionInput,
  ) => {
    await mutate({ variables: { input } });
  };

  return {
    createDraftFromWorkflowVersion,
  };
};
