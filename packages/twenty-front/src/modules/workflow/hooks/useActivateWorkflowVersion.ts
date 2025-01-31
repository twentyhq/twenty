import { useApolloClient, useMutation } from '@apollo/client';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { ACTIVATE_WORKFLOW_VERSION } from '@/workflow/graphql/mutations/activateWorkflowVersion';
import {
  ActivateWorkflowVersionMutation,
  ActivateWorkflowVersionMutationVariables,
} from '~/generated/graphql';

export const useActivateWorkflowVersion = () => {
  const apolloClient = useApolloClient();
  const [mutate] = useMutation<
    ActivateWorkflowVersionMutation,
    ActivateWorkflowVersionMutationVariables
  >(ACTIVATE_WORKFLOW_VERSION, {
    client: apolloClient,
  });

  const { findManyRecordsQuery: findManyWorkflowVersionsQuery } =
    useFindManyRecordsQuery({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const activateWorkflowVersion = async ({
    workflowVersionId,
    workflowId,
  }: {
    workflowVersionId: string;
    workflowId: string;
  }) => {
    await mutate({
      variables: {
        workflowVersionId,
      },
      refetchQueries: [
        {
          query: findManyWorkflowVersionsQuery,
          variables: {
            workflowId,
          },
        },
      ],
    });
  };

  return { activateWorkflowVersion };
};
