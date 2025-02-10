import { useApolloClient } from '@apollo/client';
import { useCallback } from 'react';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCacheOrMinimalRecord } from '@/object-record/cache/hooks/useGetRecordFromCacheOrMinimalRecord';
import { useCreateOneRecordMutation } from '@/object-record/hooks/useCreateOneRecordMutation';
import { useDestroyOneRecordMutation } from '@/object-record/hooks/useDestroyOneRecordMutation';
import { useUpdateOneRecordMutation } from '@/object-record/hooks/useUpdateOneRecordMutation';
import { GraphQLView } from '@/views/types/GraphQLView';
import { ViewFilter } from '@/views/types/ViewFilter';
import { isDefined } from 'twenty-shared';
import { v4 } from 'uuid';

export const usePersistViewFilterRecords = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ViewFilter,
  });

  const getRecordFromCacheOrMinimalRecord =
    useGetRecordFromCacheOrMinimalRecord({
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

  const apolloClient = useApolloClient();

  const createViewFilterRecords = useCallback(
    (viewFiltersToCreate: ViewFilter[], view: GraphQLView) => {
      if (viewFiltersToCreate.length === 0) return;

      return Promise.all(
        viewFiltersToCreate.map((viewFilter) =>
          apolloClient.mutate({
            mutation: createOneRecordMutation,
            variables: {
              input: {
                id: v4(),
                fieldMetadataId: viewFilter.fieldMetadataId,
                viewId: view.id,
                value: viewFilter.value,
                displayValue: viewFilter.displayValue,
                operand: viewFilter.operand,
                viewFilterGroupId: viewFilter.viewFilterGroupId,
              },
            },
            update: (cache, { data }) => {
              const record = data?.['createViewFilter'];
              if (!isDefined(record)) return;

              triggerCreateRecordsOptimisticEffect({
                cache,
                objectMetadataItem,
                recordsToCreate: [record],
                objectMetadataItems,
              });
            },
          }),
        ),
      );
    },
    [
      apolloClient,
      createOneRecordMutation,
      objectMetadataItem,
      objectMetadataItems,
    ],
  );

  const updateViewFilterRecords = useCallback(
    (viewFiltersToUpdate: ViewFilter[]) => {
      if (!viewFiltersToUpdate.length) return;
      return Promise.all(
        viewFiltersToUpdate.map((viewFilter) =>
          apolloClient.mutate({
            mutation: updateOneRecordMutation,
            variables: {
              idToUpdate: viewFilter.id,
              input: {
                value: viewFilter.value,
                displayValue: viewFilter.displayValue,
                operand: viewFilter.operand,
              },
            },
            update: (cache, { data }) => {
              const record = data?.['updateViewFilter'];
              if (!isDefined(record)) return;

              const cachedRecord =
                getRecordFromCacheOrMinimalRecord<ViewFilter>(record.id, cache);

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
      apolloClient,
      getRecordFromCacheOrMinimalRecord,
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
          apolloClient.mutate({
            mutation: destroyOneRecordMutation,
            variables: {
              idToDestroy: viewFilterId,
            },
            update: (cache, { data }) => {
              const record = data?.['destroyViewFilter'];
              if (!isDefined(record)) return;

              const cachedRecord = getRecordFromCacheOrMinimalRecord(
                record.id,
                cache,
              );
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
      apolloClient,
      destroyOneRecordMutation,
      getRecordFromCacheOrMinimalRecord,
      objectMetadataItem,
      objectMetadataItems,
    ],
  );

  return {
    createViewFilterRecords,
    updateViewFilterRecords,
    deleteViewFilterRecords,
  };
};
