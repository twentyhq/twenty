import { useMutation } from '@apollo/client';

import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { DEACTIVATE_WORKFLOW_VERSION } from '@/workflow/graphql/mutations/deactivateWorkflowVersion';
import {
  type Workflow,
  type WorkflowStatus,
  type WorkflowVersion,
} from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';
import {
  type DeactivateWorkflowVersionMutation,
  type DeactivateWorkflowVersionMutationVariables,
} from '~/generated-metadata/graphql';

export const useDeactivateWorkflowVersion = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { objectMetadataItems } = useObjectMetadataItems();
  const [mutate] = useMutation<
    DeactivateWorkflowVersionMutation,
    DeactivateWorkflowVersionMutationVariables
  >(DEACTIVATE_WORKFLOW_VERSION, {
    client: apolloCoreClient,
  });

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const { objectMetadataItem: objectMetadataItemWorkflow } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Workflow,
    });
  const { objectMetadataItem: objectMetadataItemWorkflowVersion } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const deactivateWorkflowVersion = async ({
    workflowVersionId,
  }: {
    workflowVersionId: string;
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
            status: () => 'DEACTIVATED',
          },
        });

        const cacheSnapshot = apolloCoreClient.cache.extract();
        const workflowVersion: WorkflowVersion | undefined = Object.values(
          cacheSnapshot,
        ).find(
          (item) =>
            item.__typename === 'WorkflowVersion' &&
            item.id === workflowVersionId,
        );

        if (!isDefined(workflowVersion)) {
          return;
        }

        triggerUpdateRecordOptimisticEffect({
          cache: apolloCoreClient.cache,
          objectMetadataItem: objectMetadataItemWorkflowVersion,
          currentRecord: workflowVersion,
          updatedRecord: {
            ...workflowVersion,
            status: 'DEACTIVATED',
          },
          objectMetadataItems,
          objectPermissionsByObjectMetadataId,
          upsertRecordsInStore,
        });

        const cachedWorkflow = getRecordFromCache<Workflow>({
          objectMetadataItem: objectMetadataItemWorkflow,
          cache: apolloCoreClient.cache,
          objectMetadataItems,
          objectPermissionsByObjectMetadataId,
          recordId: workflowVersion.workflowId,
        });

        const newStatuses = new Set(
          [...(cachedWorkflow?.statuses ?? []), 'DEACTIVATED'].filter(
            (status) => status !== 'ACTIVE',
          ),
        );

        if (isDefined(cachedWorkflow)) {
          modifyRecordFromCache({
            cache: apolloCoreClient.cache,
            recordId: workflowVersion.workflowId,
            objectMetadataItem: objectMetadataItemWorkflow,
            fieldModifiers: {
              statuses: () => Array.from(newStatuses),
            },
          });
          upsertRecordsInStore({
            partialRecords: [
              {
                ...cachedWorkflow,
                statuses: Array.from(newStatuses) as WorkflowStatus[],
              },
            ],
          });
        }
      },
    });
  };

  return { deactivateWorkflowVersion };
};
