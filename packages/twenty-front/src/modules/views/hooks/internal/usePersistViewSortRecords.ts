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
import { CREATE_CORE_VIEW_SORT } from '@/views/graphql/mutations/createCoreViewSort';
import { DESTROY_CORE_VIEW_SORT } from '@/views/graphql/mutations/destroyCoreViewSort';
import { UPDATE_CORE_VIEW_SORT } from '@/views/graphql/mutations/updateCoreViewSort';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { type ViewSort } from '@/views/types/ViewSort';
import { convertViewSortDirectionToCore } from '@/views/utils/convertViewSortDirectionToCore';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useApolloClient } from '@apollo/client';
import { isNull } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type CoreViewSort, FeatureFlagKey } from '~/generated/graphql';

export const usePersistViewSortRecords = () => {
  const featureFlags = useFeatureFlagsMap();
  const isCoreViewEnabled = featureFlags[FeatureFlagKey.IS_CORE_VIEW_ENABLED];

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
  const apolloClient = useApolloClient();
  const createViewSortRecords = useCallback(
    (viewSortsToCreate: ViewSort[], view: Pick<GraphQLView, 'id'>) => {
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
              id: viewSort.id,
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
              id: viewSortId,
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
    createViewSortRecords: isCoreViewEnabled
      ? createCoreViewSortRecords
      : createViewSortRecords,
    updateViewSortRecords: isCoreViewEnabled
      ? updateCoreViewSortRecords
      : updateViewSortRecords,
    deleteViewSortRecords: isCoreViewEnabled
      ? deleteCoreViewSortRecords
      : deleteViewSortRecords,
  };
};
