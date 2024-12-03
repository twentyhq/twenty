import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { useApolloClient, useMutation } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { ACTIVATE_WORKFLOW_VERSION } from '@/workflow/graphql/mutations/activateWorkflowVersion';
import { WorkflowVersion } from '@/workflow/types/Workflow';
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
    client: apolloMetadataClient,
  });

  const { objectMetadataItem: objectMetadataItemWorkflowVersion } =
    useObjectMetadataItem({
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
      update: () => {
        modifyRecordFromCache({
          cache: apolloClient.cache,
          recordId: workflowVersionId,
          objectMetadataItem: objectMetadataItemWorkflowVersion,
          fieldModifiers: {
            status: () => 'ACTIVE',
          },
        });

        const cacheSnapshot = apolloClient.cache.extract();
        const allWorkflowVersions: Array<WorkflowVersion> = Object.values(
          cacheSnapshot,
        ).filter(
          (item) =>
            item.__typename === 'WorkflowVersion' &&
            item.workflowId === workflowId,
        );

        for (const workflowVersion of allWorkflowVersions) {
          apolloClient.cache.modify({
            id: apolloClient.cache.identify(workflowVersion),
            fields: {
              status: () => {
                return workflowVersion.id !== workflowVersionId &&
                  workflowVersion.status === 'ACTIVE'
                  ? 'ARCHIVED'
                  : workflowVersion.status;
              },
            },
          });
        }
      },
    });
  };

  return { activateWorkflowVersion };
};
