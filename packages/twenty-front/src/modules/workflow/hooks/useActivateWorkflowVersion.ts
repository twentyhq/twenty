import { useApolloClient, useMutation } from '@apollo/client';

import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
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
  const apolloClient = useApolloClient();
  const [mutate] = useMutation<
    ActivateWorkflowVersionMutation,
    ActivateWorkflowVersionMutationVariables
  >(ACTIVATE_WORKFLOW_VERSION, {
    client: apolloClient,
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

        const previousActiveWorkflowVersions = allWorkflowVersions.filter(
          (version) =>
            version.status === 'ACTIVE' && version.id !== workflowVersionId,
        );

        for (const workflowVersion of previousActiveWorkflowVersions) {
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

          triggerUpdateRecordOptimisticEffect({
            cache: apolloClient.cache,
            objectMetadataItem: objectMetadataItemWorkflowVersion,
            currentRecord: workflowVersion,
            updatedRecord: {
              ...workflowVersion,
              status: 'ARCHIVED',
            },
            objectMetadataItems: [objectMetadataItemWorkflowVersion],
          });
        }
      },
    });
  };

  return { activateWorkflowVersion };
};
