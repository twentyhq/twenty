import { useApolloClient } from '@apollo/client';
import { useCallback } from 'react';

import { triggerDeleteRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDeleteRecordsOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useDeleteOneRecordMutation } from '@/object-record/hooks/useDeleteOneRecordMutation';
import { getDeleteOneRecordMutationResponseField } from '@/object-record/utils/getDeleteOneRecordMutationResponseField';
import { capitalize } from '~/utils/string/capitalize';

type useDeleteOneRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
};

export const useDeleteOneRecord = ({
  objectNameSingular,
}: useDeleteOneRecordProps) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem } = useObjectMetadataItem({
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
      const findOneQueryName = `FindOne${capitalize(objectNameSingular)}`;
      const findManyQueryName = `FindMany${capitalize(
        objectMetadataItem.namePlural,
      )}`;

      const deletedRecord = await apolloClient.mutate({
        mutation: deleteOneRecordMutation,
        variables: { idToDelete },
        refetchQueries: [findOneQueryName, findManyQueryName],
        optimisticResponse: {
          [mutationResponseField]: {
            __typename: capitalize(objectNameSingular),
            id: idToDelete,
            deletedAt: new Date().toISOString(),
          },
        },
        update: (cache, { data }) => {
          const record = data?.[mutationResponseField];

          if (!record) return;

          triggerDeleteRecordsOptimisticEffect({
            cache,
            objectMetadataItem,
            recordsToDelete: [record],
            objectMetadataItems,
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
      objectMetadataItems,
    ],
  );

  return {
    deleteOneRecord,
  };
};
