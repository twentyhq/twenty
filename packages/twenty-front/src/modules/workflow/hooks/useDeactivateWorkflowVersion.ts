import { useApolloClient, useMutation } from '@apollo/client';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { DEACTIVATE_WORKFLOW_VERSION } from '@/workflow/graphql/mutations/deactivateWorkflowVersion';
import {
  DeactivateWorkflowVersionMutation,
  DeactivateWorkflowVersionMutationVariables,
} from '~/generated/graphql';

export const useDeactivateWorkflowVersion = () => {
  const apolloClient = useApolloClient();
  const [mutate] = useMutation<
    DeactivateWorkflowVersionMutation,
    DeactivateWorkflowVersionMutationVariables
  >(DEACTIVATE_WORKFLOW_VERSION, {
    client: apolloClient,
  });

  const { findManyRecordsQuery: findManyWorkflowVersionsQuery } =
    useFindManyRecordsQuery({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const deactivateWorkflowVersion = async ({
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

  return { deactivateWorkflowVersion };
};
