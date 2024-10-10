import { useApolloClient } from '@apollo/client';
import { useCallback } from 'react';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { triggerDeleteRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDeleteRecordsOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useDeleteOneRecordMutation } from '@/object-record/hooks/useDeleteOneRecordMutation';
import { getDeleteOneRecordMutationResponseField } from '@/object-record/utils/getDeleteOneRecordMutationResponseField';
import { capitalize } from '~/utils/string/capitalize';

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

  const mutationResponseField =
    getDeleteOneRecordMutationResponseField(objectNameSingular);

  const deleteOneRecord = useCallback(
    async (idToDelete: string) => {
      const currentTimestamp = new Date().toISOString();

      const deletedRecord = await apolloClient
        .mutate({
          mutation: deleteOneRecordMutation,
          variables: {
            idToDelete: idToDelete,
          },
          optimisticResponse: {
            [mutationResponseField]: {
              __typename: capitalize(objectNameSingular),
              id: idToDelete,
              deletedAt: currentTimestamp,
            },
          },
          update: (cache, { data }) => {
            const record = data?.[mutationResponseField];

            if (!record) return;

            const cachedRecord = getRecordFromCache(record.id, cache);

            if (!cachedRecord) return;

            triggerDeleteRecordsOptimisticEffect({
              cache,
              objectMetadataItem,
              recordsToDelete: [cachedRecord],
              objectMetadataItems,
            });
          },
        })
        .catch((error: Error) => {
          const cachedRecord = getRecordFromCache(
            idToDelete,
            apolloClient.cache,
          );

          if (!cachedRecord) {
            throw error;
          }

          updateRecordFromCache({
            objectMetadataItems,
            objectMetadataItem,
            cache: apolloClient.cache,
            record: {
              ...cachedRecord,
              deletedAt: null,
            },
          });

          triggerCreateRecordsOptimisticEffect({
            cache: apolloClient.cache,
            objectMetadataItem,
            objectMetadataItems,
            recordsToCreate: [
              {
                ...cachedRecord,
                deletedAt: null,
              },
            ],
          });

          throw error;
        });

      return deletedRecord.data?.[mutationResponseField] ?? null;
    },
    [
      apolloClient,
      deleteOneRecordMutation,
      getRecordFromCache,
      mutationResponseField,
      objectMetadataItem,
      objectNameSingular,
      objectMetadataItems,
    ],
  );

  return {
    deleteOneRecord,
  };
};
