import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';

import { triggerDeleteRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDeleteRecordsOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getDeleteOneRecordMutationResponseField } from '@/object-record/utils/generateDeleteOneRecordMutation';
import { capitalize } from '~/utils/string/capitalize';

type useDeleteOneRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
};

export const useDeleteOneRecord = ({
  objectNameSingular,
}: useDeleteOneRecordProps) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem, deleteOneRecordMutation, getRecordFromCache } =
    useObjectMetadataItem({ objectNameSingular });

  const { objectMetadataItems } = useObjectMetadataItems();

  const mutationResponseField =
    getDeleteOneRecordMutationResponseField(objectNameSingular);

  const deleteOneRecord = useCallback(
    async (idToDelete: string) => {
      const deletedRecord = await apolloClient.mutate({
        mutation: deleteOneRecordMutation,
        variables: { idToDelete },
        optimisticResponse: {
          [mutationResponseField]: {
            __typename: capitalize(objectNameSingular),
            id: idToDelete,
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
