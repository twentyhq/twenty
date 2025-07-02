import { useCallback } from 'react';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useCreateOneRecordMutation } from '@/object-record/hooks/useCreateOneRecordMutation';
import { useDestroyOneRecordMutation } from '@/object-record/hooks/useDestroyOneRecordMutation';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpdateOneRecordMutation } from '@/object-record/hooks/useUpdateOneRecordMutation';
import { GraphQLView } from '@/views/types/GraphQLView';
import { ViewSort } from '@/views/types/ViewSort';
import { isDefined } from 'twenty-shared/utils';

export const usePersistViewSortRecords = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ViewSort,
  });

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.ViewSort,
  });

  const { destroyOneRecordMutation } = useDestroyOneRecordMutation({
    objectNameSingular: CoreObjectNameSingular.ViewSort,
  });

  const { createOneRecordMutation } = useCreateOneRecordMutation({
    objectNameSingular: CoreObjectNameSingular.ViewSort,
  });

  const { updateOneRecordMutation } = useUpdateOneRecordMutation({
    objectNameSingular: CoreObjectNameSingular.ViewSort,
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const apolloCoreClient = useApolloCoreClient();

  const createViewSortRecords = useCallback(
    (viewSortsToCreate: ViewSort[], view: GraphQLView) => {
      if (!viewSortsToCreate.length) return;
      return Promise.all(
        viewSortsToCreate.map((viewSort) =>
          apolloCoreClient.mutate({
            mutation: createOneRecordMutation,
            variables: {
              input: {
                fieldMetadataId: viewSort.fieldMetadataId,
                viewId: view.id,
                direction: viewSort.direction,
                id: viewSort.id,
              },
            },
            update: (cache, { data }) => {
              const record = data?.['createViewSort'];
              if (!isDefined(record)) return;

              triggerCreateRecordsOptimisticEffect({
                cache,
                objectMetadataItem,
                recordsToCreate: [record],
                objectMetadataItems,
                objectPermissionsByObjectMetadataId,
              });
            },
          }),
        ),
      );
    },
    [
      apolloCoreClient,
      createOneRecordMutation,
      objectMetadataItem,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    ],
  );

  const updateViewSortRecords = useCallback(
    (viewSortsToUpdate: ViewSort[]) => {
      if (!viewSortsToUpdate.length) return;
      return Promise.all(
        viewSortsToUpdate.map((viewSort) =>
          apolloCoreClient.mutate({
            mutation: updateOneRecordMutation,
            variables: {
              idToUpdate: viewSort.id,
              input: {
                direction: viewSort.direction,
              },
            },
            update: (cache, { data }) => {
              const record = data?.['updateViewSort'];
              if (!isDefined(record)) return;

              const cachedRecord = getRecordFromCache<ViewSort>(
                record.id,
                cache,
              );
              if (!isDefined(cachedRecord)) return;

              triggerUpdateRecordOptimisticEffect({
                cache,
                objectMetadataItem,
                currentRecord: cachedRecord,
                updatedRecord: record,
                objectMetadataItems,
              });
            },
          }),
        ),
      );
    },
    [
      apolloCoreClient,
      getRecordFromCache,
      objectMetadataItem,
      objectMetadataItems,
      updateOneRecordMutation,
    ],
  );

  const deleteViewSortRecords = useCallback(
    (viewSortIdsToDelete: string[]) => {
      if (!viewSortIdsToDelete.length) return;
      return Promise.all(
        viewSortIdsToDelete.map((viewSortId) =>
          apolloCoreClient.mutate({
            mutation: destroyOneRecordMutation,
            variables: {
              idToDestroy: viewSortId,
            },
            update: (cache, { data }) => {
              const record = data?.['destroyViewSort'];
              if (!isDefined(record)) return;

              const cachedRecord = getRecordFromCache<ViewSort>(
                record.id,
                cache,
              );
              if (!isDefined(cachedRecord)) return;

              triggerDestroyRecordsOptimisticEffect({
                cache,
                objectMetadataItem,
                recordsToDestroy: [cachedRecord],
                objectMetadataItems,
              });
            },
          }),
        ),
      );
    },
    [
      apolloCoreClient,
      destroyOneRecordMutation,
      getRecordFromCache,
      objectMetadataItem,
      objectMetadataItems,
    ],
  );

  return {
    createViewSortRecords,
    updateViewSortRecords,
    deleteViewSortRecords,
  };
};
