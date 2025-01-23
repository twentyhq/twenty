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

      const preDeletionCachedRecord = getRecordFromCache(
        idToDelete,
        apolloClient.cache,
      );

      const cachedRecordWithConnection = getRecordNodeFromRecord<ObjectRecord>({
        record: preDeletionCachedRecord,
        objectMetadataItem,
        objectMetadataItems,
        computeReferences: true,
      });

      const computedOptimisticRecord = {
        id: idToDelete,
        deletedAt: currentTimestamp,
        __typename: capitalize(objectMetadataItem.nameSingular),
      };

      const postDeletionOptimisticRecordWithConnection =
        getRecordNodeFromRecord({
          record: computedOptimisticRecord,
          objectMetadataItem,
          objectMetadataItems,
          computeReferences: true,
        });

      if (
        !postDeletionOptimisticRecordWithConnection ||
        !cachedRecordWithConnection
      ) {
        return null;
      }

      if (isDefined(preDeletionCachedRecord)) {
        deleteRecordFromCache({
          cache: apolloClient.cache,
          objectMetadataItem,
          objectMetadataItems,
          recordToDestroy: preDeletionCachedRecord,
        });
      }

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
          updateRecordFromCache({
            objectMetadataItems,
            objectMetadataItem,
            cache: apolloClient.cache,
            record: preDeletionCachedRecord,
          });

          const preDeletionOptimisticRecordWithConnection =
            getRecordNodeFromRecord({
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
          }

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
