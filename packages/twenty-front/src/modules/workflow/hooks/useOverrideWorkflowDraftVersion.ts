import { useApolloClient } from '@apollo/client';
import {
  OverrideWorkflowDraftVersionInput,
  useOverrideWorkflowDraftVersionMutation,
} from '~/generated/graphql';

export const useOverrideWorkflowDraftVersion = () => {
  const apolloClient = useApolloClient();

  const [mutate] = useOverrideWorkflowDraftVersionMutation({
    client: apolloClient,
  });

  const overrideWorkflowDraftVersion = async (
    input: OverrideWorkflowDraftVersionInput,
  ) => {
    await mutate({ variables: { input } });
  };

  return {
    overrideWorkflowDraftVersion,
  };
};
