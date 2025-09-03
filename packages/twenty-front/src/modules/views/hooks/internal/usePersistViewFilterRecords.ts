import { useCallback } from 'react';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { CREATE_CORE_VIEW_FILTER } from '@/views/graphql/mutations/createCoreViewFilter';
import { DESTROY_CORE_VIEW_FILTER } from '@/views/graphql/mutations/destroyCoreViewFilter';
import { UPDATE_CORE_VIEW_FILTER } from '@/views/graphql/mutations/updateCoreViewFilter';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { convertViewFilterOperandToCore } from '@/views/utils/convertViewFilterOperandToCore';
import { useApolloClient } from '@apollo/client';
import { isNull } from '@sniptt/guards';
import { isDefined, parseJson } from 'twenty-shared/utils';
import { type CoreViewFilter } from '~/generated/graphql';

export const usePersistViewFilterRecords = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ViewFilter,
  });

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.ViewFilter,
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const apolloClient = useApolloClient();

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
                value: parseJson(viewFilter.value),
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
    createViewFilterRecords: createCoreViewFilterRecords,
    updateViewFilterRecords: updateCoreViewFilterRecords,
    deleteViewFilterRecords: deleteCoreViewFilterRecords,
  };
};
