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
import { CREATE_CORE_VIEW_FILTER } from '@/views/graphql/mutations/createCoreViewFilter';
import { DESTROY_CORE_VIEW_FILTER } from '@/views/graphql/mutations/destroyCoreViewFilter';
import { UPDATE_CORE_VIEW_FILTER } from '@/views/graphql/mutations/updateCoreViewFilter';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { convertViewFilterOperandToCore } from '@/views/utils/convertViewFilterOperandToCore';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useApolloClient } from '@apollo/client';
import { isNull } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type CoreViewFilter, FeatureFlagKey } from '~/generated/graphql';

export const usePersistViewFilterRecords = () => {
  const featureFlags = useFeatureFlagsMap();
  const isCoreViewEnabled = featureFlags[FeatureFlagKey.IS_CORE_VIEW_ENABLED];

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ViewFilter,
  });

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.ViewFilter,
  });

  const { destroyOneRecordMutation } = useDestroyOneRecordMutation({
    objectNameSingular: CoreObjectNameSingular.ViewFilter,
  });

  const { createOneRecordMutation } = useCreateOneRecordMutation({
    objectNameSingular: CoreObjectNameSingular.ViewFilter,
  });

  const { updateOneRecordMutation } = useUpdateOneRecordMutation({
    objectNameSingular: CoreObjectNameSingular.ViewFilter,
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const apolloCoreClient = useApolloCoreClient();
  const apolloClient = useApolloClient();
  const createViewFilterRecords = useCallback(
    (viewFiltersToCreate: ViewFilter[], view: Pick<GraphQLView, 'id'>) => {
      if (viewFiltersToCreate.length === 0) return;

      return Promise.all(
        viewFiltersToCreate.map((viewFilter) =>
          apolloCoreClient.mutate({
            mutation: createOneRecordMutation,
            variables: {
              input: {
                id: viewFilter.id,
                fieldMetadataId: viewFilter.fieldMetadataId,
                viewId: view.id,
                value: viewFilter.value,
                displayValue: viewFilter.displayValue,
                operand: viewFilter.operand,
                viewFilterGroupId: viewFilter.viewFilterGroupId,
                positionInViewFilterGroup: viewFilter.positionInViewFilterGroup,
                subFieldName: viewFilter.subFieldName ?? null,
              } satisfies Partial<ViewFilter>,
            },
            update: (cache, { data }) => {
              const record = data?.['createViewFilter'];
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

  const updateViewFilterRecords = useCallback(
    (viewFiltersToUpdate: ViewFilter[]) => {
      if (!viewFiltersToUpdate.length) return;
      return Promise.all(
        viewFiltersToUpdate.map((viewFilter) =>
          apolloCoreClient.mutate({
            mutation: updateOneRecordMutation,
            variables: {
              id: viewFilter.id,
              input: {
                value: viewFilter.value,
                displayValue: viewFilter.displayValue,
                operand: viewFilter.operand,
                positionInViewFilterGroup: viewFilter.positionInViewFilterGroup,
                viewFilterGroupId: viewFilter.viewFilterGroupId,
                subFieldName: viewFilter.subFieldName ?? null,
              } satisfies Partial<ViewFilter>,
            },
            update: (cache, { data }) => {
              const record = data?.['updateViewFilter'];
              if (!isDefined(record)) return;

              const cachedRecord = getRecordFromCache<ViewFilter>(
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

  const deleteViewFilterRecords = useCallback(
    (viewFilterIdsToDelete: string[]) => {
      if (!viewFilterIdsToDelete.length) return;
      return Promise.all(
        viewFilterIdsToDelete.map((viewFilterId) =>
          apolloCoreClient.mutate({
            mutation: destroyOneRecordMutation,
            variables: {
              id: viewFilterId,
            },
            update: (cache, { data }) => {
              const record = data?.['destroyViewFilter'];
              if (!isDefined(record)) return;

              const cachedRecord = getRecordFromCache<ViewFilter>(
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

  const createCoreViewFilterRecords = useCallback(
    (viewFiltersToCreate: ViewFilter[], view: Pick<GraphQLView, 'id'>) => {
      if (viewFiltersToCreate.length === 0) return;

      return Promise.all(
        viewFiltersToCreate.map((viewFilter) =>
          apolloClient.mutate({
            mutation: CREATE_CORE_VIEW_FILTER,
            variables: {
              input: {
                id: viewFilter.id,
                fieldMetadataId: viewFilter.fieldMetadataId,
                viewId: view.id,
                value: viewFilter.value,
                operand: convertViewFilterOperandToCore(viewFilter.operand),
                viewFilterGroupId: viewFilter.viewFilterGroupId,
                positionInViewFilterGroup: viewFilter.positionInViewFilterGroup,
                subFieldName: viewFilter.subFieldName ?? null,
              } satisfies Partial<CoreViewFilter>,
            },
            update: (cache, { data }) => {
              const record = data?.['createCoreViewFilter'];
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

  const updateCoreViewFilterRecords = useCallback(
    (viewFiltersToUpdate: ViewFilter[]) => {
      if (!viewFiltersToUpdate.length) return;
      return Promise.all(
        viewFiltersToUpdate.map((viewFilter) =>
          apolloClient.mutate({
            mutation: UPDATE_CORE_VIEW_FILTER,
            variables: {
              id: viewFilter.id,
              input: {
                value: viewFilter.value,
                operand: convertViewFilterOperandToCore(viewFilter.operand),
                positionInViewFilterGroup: viewFilter.positionInViewFilterGroup,
                viewFilterGroupId: viewFilter.viewFilterGroupId,
                subFieldName: viewFilter.subFieldName ?? null,
              } satisfies Partial<CoreViewFilter>,
            },
            update: (cache, { data }) => {
              const record = data?.['updateCoreViewFilter'];
              if (!isDefined(record)) return;

              const cachedRecord = getRecordFromCache<ViewFilter>(
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

  const deleteCoreViewFilterRecords = useCallback(
    (viewFilterIdsToDelete: string[]) => {
      if (!viewFilterIdsToDelete.length) return;
      return Promise.all(
        viewFilterIdsToDelete.map((viewFilterId) =>
          apolloClient.mutate({
            mutation: DESTROY_CORE_VIEW_FILTER,
            variables: {
              id: viewFilterId,
            },
            update: (cache, { data }) => {
              const record = data?.['destroyCoreViewFilter'];
              if (!isDefined(record)) return;

              const cachedRecord = getRecordFromCache<ViewFilter>(
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
    createViewFilterRecords: isCoreViewEnabled
      ? createCoreViewFilterRecords
      : createViewFilterRecords,
    updateViewFilterRecords: isCoreViewEnabled
      ? updateCoreViewFilterRecords
      : updateViewFilterRecords,
    deleteViewFilterRecords: isCoreViewEnabled
      ? deleteCoreViewFilterRecords
      : deleteViewFilterRecords,
  };
};
