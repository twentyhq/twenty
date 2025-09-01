import { useCallback } from 'react';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { CREATE_CORE_VIEW_SORT } from '@/views/graphql/mutations/createCoreViewSort';
import { DESTROY_CORE_VIEW_SORT } from '@/views/graphql/mutations/destroyCoreViewSort';
import { UPDATE_CORE_VIEW_SORT } from '@/views/graphql/mutations/updateCoreViewSort';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { type ViewSort } from '@/views/types/ViewSort';
import { convertViewSortDirectionToCore } from '@/views/utils/convertViewSortDirectionToCore';
import { useApolloClient } from '@apollo/client';
import { isNull } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type CoreViewSort } from '~/generated/graphql';

export const usePersistViewSortRecords = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ViewSort,
  });

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.ViewSort,
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const apolloClient = useApolloClient();

  const createCoreViewSortRecords = useCallback(
    (viewSortsToCreate: ViewSort[], view: Pick<GraphQLView, 'id'>) => {
      if (!viewSortsToCreate.length) return;
      return Promise.all(
        viewSortsToCreate.map((viewSort) =>
          apolloClient.mutate({
            mutation: CREATE_CORE_VIEW_SORT,
            variables: {
              input: {
                id: viewSort.id,
                fieldMetadataId: viewSort.fieldMetadataId,
                viewId: view.id,
                direction: convertViewSortDirectionToCore(viewSort.direction),
              } satisfies Partial<CoreViewSort>,
            },
            update: (cache, { data }) => {
              const record = data?.['createCoreViewSort'];
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
      apolloClient,
      objectMetadataItem,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    ],
  );

  const updateCoreViewSortRecords = useCallback(
    (viewSortsToUpdate: ViewSort[]) => {
      if (!viewSortsToUpdate.length) return;
      return Promise.all(
        viewSortsToUpdate.map((viewSort) =>
          apolloClient.mutate({
            mutation: UPDATE_CORE_VIEW_SORT,
            variables: {
              id: viewSort.id,
              input: {
                direction: convertViewSortDirectionToCore(viewSort.direction),
              } satisfies Partial<CoreViewSort>,
            },
            update: (cache, { data }) => {
              const record = data?.['updateCoreViewSort'];
              if (!isDefined(record)) return;

              const cachedRecord = getRecordFromCache<ViewSort>(
                record.id,
                cache,
              );
              if (isNull(cachedRecord)) return;

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
    [apolloClient, getRecordFromCache, objectMetadataItem, objectMetadataItems],
  );

  const deleteCoreViewSortRecords = useCallback(
    (viewSortIdsToDelete: string[]) => {
      if (!viewSortIdsToDelete.length) return;
      return Promise.all(
        viewSortIdsToDelete.map((viewSortId) =>
          apolloClient.mutate({
            mutation: DESTROY_CORE_VIEW_SORT,
            variables: {
              id: viewSortId,
            },
            update: (cache, { data }) => {
              const record = data?.['destroyCoreViewSort'];
              if (!isDefined(record)) return;

              const cachedRecord = getRecordFromCache<ViewSort>(
                record.id,
                cache,
              );
              if (isNull(cachedRecord)) return;

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
    [apolloClient, getRecordFromCache, objectMetadataItem, objectMetadataItems],
  );

  return {
    createViewSortRecords: createCoreViewSortRecords,
    updateViewSortRecords: updateCoreViewSortRecords,
    deleteViewSortRecords: deleteCoreViewSortRecords,
  };
};
