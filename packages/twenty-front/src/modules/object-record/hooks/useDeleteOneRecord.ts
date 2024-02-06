import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';

import { triggerDeleteRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDeleteRecordsOptimisticEffect';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
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

  const { objectMetadataItem, deleteOneRecordMutation } = useObjectMetadataItem(
    { objectNameSingular },
  );
  const getRecordFromCache = useGetRecordFromCache();

  const getRelationMetadata = useGetRelationMetadata();

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

          const cachedRecord = getRecordFromCache({
            recordId: record.id,
            cache,
            objectMetadataItem,
          });

          if (!cachedRecord) return;

          triggerDeleteRecordsOptimisticEffect({
            cache,
            objectMetadataItem,
            records: [cachedRecord],
            getRelationMetadata,
          });
        },
      });

      return deletedRecord.data?.[mutationResponseField] ?? null;
    },
    [
      apolloClient,
      deleteOneRecordMutation,
      getRecordFromCache,
      getRelationMetadata,
      mutationResponseField,
      objectMetadataItem,
      objectNameSingular,
    ],
  );

  return {
    deleteOneRecord,
  };
};
