import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';

import { triggerDeleteRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDeleteRecordsOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getDeleteOneRecordMutationResponseField } from '@/object-record/utils/generateDeleteOneRecordMutation';
import { capitalize } from '~/utils/string/capitalize';

type useDeleteOneRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
};

export const useDeleteOneRecord = ({
  objectNameSingular,
}: useDeleteOneRecordProps) => {
  const { objectMetadataItem, deleteOneRecordMutation } = useObjectMetadataItem(
    { objectNameSingular },
  );

  const apolloClient = useApolloClient();

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

          triggerDeleteRecordsOptimisticEffect({
            cache,
            objectMetadataItem,
            records: [record],
          });
        },
      });

      return deletedRecord.data?.[mutationResponseField] ?? null;
    },
    [
      apolloClient,
      deleteOneRecordMutation,
      mutationResponseField,
      objectMetadataItem,
      objectNameSingular,
    ],
  );

  return {
    deleteOneRecord,
  };
};
