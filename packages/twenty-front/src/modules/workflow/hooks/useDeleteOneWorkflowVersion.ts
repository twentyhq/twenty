import { useCallback } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type Workflow, type WorkflowVersion } from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

export const useDeleteOneWorkflowVersion = () => {
  const apolloCoreClient = useApolloCoreClient();
  const getWorkflowVersionFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });
  const getWorkflowFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });
  const { objectMetadataItem: objectMetadataItemWorkflow } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Workflow,
    });
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const handleUpdate = useCallback(
    (workflowVersionId: string) => {
      if (!workflowVersionId) {
        return;
      }

      const cache = apolloCoreClient.cache;

      const cachedWorkflowVersion =
        getWorkflowVersionFromCache<WorkflowVersion>(workflowVersionId);

      if (!isDefined(cachedWorkflowVersion)) {
        return;
      }

      const cachedWorkflow = getWorkflowFromCache<Workflow>(
        cachedWorkflowVersion.workflowId,
      );

      if (!isDefined(cachedWorkflow)) {
        return;
      }

      modifyRecordFromCache({
        objectMetadataItem: objectMetadataItemWorkflow,
        cache,
        recordId: cachedWorkflow.id,
        fieldModifiers: {
          versions: () => {
            return cachedWorkflow.versions.filter(
              (version) => version.id !== workflowVersionId,
            );
          },
          statuses: () => {
            return (
              cachedWorkflow.statuses?.filter((status) => status !== 'DRAFT') ??
              []
            );
          },
        },
      });

      upsertRecordsInStore({
        partialRecords: [
          {
            ...cachedWorkflow,
            statuses:
              cachedWorkflow.statuses?.filter((status) => status !== 'DRAFT') ??
              [],
            versions: cachedWorkflow.versions.filter(
              (version) => version.id !== workflowVersionId,
            ),
          },
        ],
      });
    },
    [
      apolloCoreClient.cache,
      getWorkflowFromCache,
      getWorkflowVersionFromCache,
      objectMetadataItemWorkflow,
      upsertRecordsInStore,
    ],
  );

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });

  const deleteOneWorkflowVersion = async ({
    workflowVersionId,
  }: {
    workflowVersionId: string;
  }) => {
    await deleteOneRecord(workflowVersionId);
    handleUpdate(workflowVersionId);
  };

  return { deleteOneWorkflowVersion };
};
