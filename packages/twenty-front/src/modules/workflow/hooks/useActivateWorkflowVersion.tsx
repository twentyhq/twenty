import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { ApolloClient, useApolloClient, useMutation } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { ACTIVATE_WORKFLOW_VERSION } from '@/workflow/graphql/activateWorkflowVersion';
import {
  ActivateWorkflowVersionMutation,
  ActivateWorkflowVersionMutationVariables,
} from '~/generated/graphql';

export const useActivateWorkflowVersion = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const apolloClient = useApolloClient();
  const [mutate] = useMutation<
    ActivateWorkflowVersionMutation,
    ActivateWorkflowVersionMutationVariables
  >(ACTIVATE_WORKFLOW_VERSION, {
    client: apolloMetadataClient ?? ({} as ApolloClient<any>),
  });

  const { objectMetadataItem: objectMetadataItemWorkflowVersion } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const activateWorkflowVersion = async (workflowVersionId: string) => {
    await mutate({
      variables: {
        workflowVersionId,
      },
      update: () => {
        modifyRecordFromCache({
          cache: apolloClient.cache,
          recordId: workflowVersionId,
          objectMetadataItem: objectMetadataItemWorkflowVersion,
          fieldModifiers: {
            status: () => 'ACTIVE',
          },
        });
      },
    });
  };

  return { activateWorkflowVersion };
};
