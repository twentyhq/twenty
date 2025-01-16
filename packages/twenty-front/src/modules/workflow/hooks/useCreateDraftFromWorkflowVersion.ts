import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
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

  const { findManyRecordsQuery: findManyWorkflowsQuery } =
    useFindManyRecordsQuery({
      objectNameSingular: CoreObjectNameSingular.Workflow,
      recordGqlFields: {
        id: true,
        name: true,
        statuses: true,
        lastPublishedVersionId: true,
        versions: true,
      },
    });

  const createDraftFromWorkflowVersion = async (
    input: CreateDraftFromWorkflowVersionInput,
  ) => {
    await mutate({
      variables: { input },
      awaitRefetchQueries: true,
      refetchQueries: [
        {
          query: findManyWorkflowsQuery,
          variables: {
            id: input.workflowId,
          },
        },
      ],
    });
  };

  return {
    createDraftFromWorkflowVersion,
  };
};
