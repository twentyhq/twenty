import { useApolloClient } from '@apollo/client';
import { useCallback } from 'react';

import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useDeleteOneRecordMutation } from '@/object-record/hooks/useDeleteOneRecordMutation';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getDeleteOneRecordMutationResponseField } from '@/object-record/utils/getDeleteOneRecordMutationResponseField';
import { capitalize, isDefined } from 'twenty-shared';

type useDeleteOneRecordProps = {
  objectNameSingular: string;
};

export const useDeleteOneRecord = ({
  objectNameSingular,
}: useDeleteOneRecordProps) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular,
  });

  const { deleteOneRecordMutation } = useDeleteOneRecordMutation({
    objectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const mutationResponseField =
    getDeleteOneRecordMutationResponseField(objectNameSingular);

  const deleteOneRecord = useCallback(
    async (idToDelete: string) => {
      const minimalRecord = {
        __typename: capitalize(objectMetadataItem.nameSingular),
        id: idToDelete,
      };
      const cachedRecord: ObjectRecord =
        getRecordFromCache(idToDelete, apolloClient.cache) ?? minimalRecord;
      const cachedRecordNode = getRecordNodeFromRecord<ObjectRecord>({
        record: cachedRecord,
        objectMetadataItem,
        objectMetadataItems,
        computeReferences: false,
      });

      const currentTimestamp = new Date().toISOString();
      const computedOptimisticRecord = {
        ...cachedRecord,
        deletedAt: currentTimestamp,
      };
      const optimisticRecordNode = getRecordNodeFromRecord<ObjectRecord>({
        record: computedOptimisticRecord,
        objectMetadataItem,
        objectMetadataItems,
        computeReferences: false,
      });

      if (!isDefined(optimisticRecordNode) || !isDefined(cachedRecordNode)) {
        throw new Error(
          'Should never occurs, encountered empty cache should fallbacked',
        );
      }

      const recordGqlFields = {
        deletedAt: true,
      };
      updateRecordFromCache({
        objectMetadataItems,
        objectMetadataItem,
        cache: apolloClient.cache,
        record: computedOptimisticRecord,
        recordGqlFields,
      });

      triggerUpdateRecordOptimisticEffect({
        cache: apolloClient.cache,
        objectMetadataItem,
        currentRecord: cachedRecordNode,
        updatedRecord: optimisticRecordNode,
        objectMetadataItems,
      });

      const deletedRecord = await apolloClient
        .mutate({
          mutation: deleteOneRecordMutation,
          variables: {
            idToDelete: idToDelete,
          },
          update: (cache, { data }) => {
            const record = data?.[mutationResponseField];

            if (!isDefined(record) || !isDefined(computedOptimisticRecord))
              return;

            triggerUpdateRecordOptimisticEffect({
              cache,
              objectMetadataItem,
              currentRecord: computedOptimisticRecord,
              updatedRecord: record,
              objectMetadataItems,
            });
          },
        })
        .catch((error: Error) => {
          const recordGqlFields = {
            deletedAt: true,
          };
          updateRecordFromCache({
            objectMetadataItems,
            objectMetadataItem,
            cache: apolloClient.cache,
            record: {
              ...cachedRecord,
              deletedAt: null,
            },
            recordGqlFields,
          });

          triggerUpdateRecordOptimisticEffect({
            cache: apolloClient.cache,
            objectMetadataItem,
            currentRecord: optimisticRecordNode,
            updatedRecord: cachedRecordNode,
            objectMetadataItems,
          });

          throw error;
        });

      await refetchAggregateQueries();
      return deletedRecord.data?.[mutationResponseField] ?? null;
    },
    [
      apolloClient,
      deleteOneRecordMutation,
      getRecordFromCache,
      mutationResponseField,
      objectMetadataItem,
      objectMetadataItems,
      refetchAggregateQueries,
    ],
  );

  return {
    deleteOneRecord,
  };
};
