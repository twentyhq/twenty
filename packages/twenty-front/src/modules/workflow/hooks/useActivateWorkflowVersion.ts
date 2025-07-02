import { useMutation } from '@apollo/client';

import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { ACTIVATE_WORKFLOW_VERSION } from '@/workflow/graphql/mutations/activateWorkflowVersion';
import { WorkflowVersion } from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';
import {
  ActivateWorkflowVersionMutation,
  ActivateWorkflowVersionMutationVariables,
} from '~/generated-metadata/graphql';

export const useActivateWorkflowVersion = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [mutate] = useMutation<
    ActivateWorkflowVersionMutation,
    ActivateWorkflowVersionMutationVariables
  >(ACTIVATE_WORKFLOW_VERSION, {
    client: apolloCoreClient,
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
          cache: apolloCoreClient.cache,
          recordId: workflowVersionId,
          objectMetadataItem: objectMetadataItemWorkflowVersion,
          fieldModifiers: {
            status: () => 'ACTIVE',
          },
        });

        const cacheSnapshot = apolloCoreClient.cache.extract();
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

        const newlyActiveWorkflowVersion = allWorkflowVersions.find(
          (version) => version.id === workflowVersionId,
        );

        if (isDefined(newlyActiveWorkflowVersion)) {
          triggerUpdateRecordOptimisticEffect({
            cache: apolloCoreClient.cache,
            objectMetadataItem: objectMetadataItemWorkflowVersion,
            currentRecord: newlyActiveWorkflowVersion,
            updatedRecord: {
              ...newlyActiveWorkflowVersion,
              status: 'ACTIVE',
            },
            objectMetadataItems: [objectMetadataItemWorkflowVersion],
          });
        }

        for (const workflowVersion of previousActiveWorkflowVersions) {
          apolloCoreClient.cache.modify({
            id: apolloCoreClient.cache.identify(workflowVersion),
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
            cache: apolloCoreClient.cache,
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
