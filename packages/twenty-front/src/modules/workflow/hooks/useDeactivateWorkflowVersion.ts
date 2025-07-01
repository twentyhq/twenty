import { useMutation } from '@apollo/client';

import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { DEACTIVATE_WORKFLOW_VERSION } from '@/workflow/graphql/mutations/deactivateWorkflowVersion';
import { WorkflowVersion } from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';
import {
  DeactivateWorkflowVersionMutation,
  DeactivateWorkflowVersionMutationVariables,
} from '~/generated-metadata/graphql';

export const useDeactivateWorkflowVersion = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [mutate] = useMutation<
    DeactivateWorkflowVersionMutation,
    DeactivateWorkflowVersionMutationVariables
  >(DEACTIVATE_WORKFLOW_VERSION, {
    client: apolloCoreClient,
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
          objectMetadataItems: [objectMetadataItemWorkflowVersion],
        });
      },
    });
  };

  return { deactivateWorkflowVersion };
};
