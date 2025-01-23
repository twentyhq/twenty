import { useApolloClient } from '@apollo/client';
import { useCallback } from 'react';

import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { deleteRecordFromCache } from '@/object-record/cache/utils/deleteRecordFromCache';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useDeleteOneRecordMutation } from '@/object-record/hooks/useDeleteOneRecordMutation';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getDeleteOneRecordMutationResponseField } from '@/object-record/utils/getDeleteOneRecordMutationResponseField';
import { capitalize } from 'twenty-shared';
import { isDefined } from 'twenty-ui';

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
      const currentTimestamp = new Date().toISOString();

      const preDeletionCachedRecord = getRecordFromCache(idToDelete, apolloClient.cache);

      const cachedRecordWithConnection = getRecordNodeFromRecord<ObjectRecord>({
        record: preDeletionCachedRecord,
        objectMetadataItem,
        objectMetadataItems,
        computeReferences: true,
      });

      const computedOptimisticRecord = {
        id: idToDelete,
        deletedAt: currentTimestamp, // this is never sent to the api so that's ok
        __typename: capitalize(objectMetadataItem.nameSingular),
      };

      const postDeletionOptimisticRecordWithConnection = getRecordNodeFromRecord({
        record: computedOptimisticRecord,
        objectMetadataItem,
        objectMetadataItems,
        computeReferences: true,
      });

      // I don't understand this condition
      // We should not delete the record if it has no relations ?
      if (!postDeletionOptimisticRecordWithConnection || !cachedRecordWithConnection) {
        return null;
      }

      if (isDefined(preDeletionCachedRecord)) {
        deleteRecordFromCache({
          cache: apolloClient.cache,
          objectMetadataItem,
          objectMetadataItems,
          recordToDestroy: preDeletionCachedRecord
        })
      }

      // I think this is used to only update relations to the current record ?
      // Should be replaced by something like triggerDeleteRecordOptimisticEffect
      // If we do an eviction above is this really necessary ?
      triggerUpdateRecordOptimisticEffect({
        cache: apolloClient.cache,
        objectMetadataItem,
        currentRecord: cachedRecordWithConnection,
        updatedRecord: postDeletionOptimisticRecordWithConnection,
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
            if (!record || !postDeletionOptimisticRecordWithConnection) return;
            console.log({ record, postDeletionOptimisticRecordWithConnection });

            // we're updating the cache twice ?
            triggerUpdateRecordOptimisticEffect({
              cache,
              objectMetadataItem,
              currentRecord: postDeletionOptimisticRecordWithConnection,
              updatedRecord: record,
              objectMetadataItems,
            });
          },
        })
        .catch((error: Error) => {
          if (!preDeletionCachedRecord) {
            throw error;
          }
          // Will it does a create ?
          updateRecordFromCache({
            objectMetadataItems,
            objectMetadataItem,
            cache: apolloClient.cache,
            record: preDeletionCachedRecord,
          });

          const preDeletionOptimisticRecordWithConnection = getRecordNodeFromRecord({
            record: preDeletionCachedRecord,
            objectMetadataItem,
            objectMetadataItems,
            computeReferences: true,
          });

          if (isDefined(preDeletionOptimisticRecordWithConnection)) {
            triggerUpdateRecordOptimisticEffect({
              cache: apolloClient.cache,
              objectMetadataItem,
              currentRecord: preDeletionOptimisticRecordWithConnection,
              updatedRecord: cachedRecordWithConnection,
              objectMetadataItems,
            });
          };
    

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
