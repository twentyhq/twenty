import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useOptimisticEvict } from '@/apollo/optimistic-effect/hooks/useOptimisticEvict';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

type useDeleteOneRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
};

export const useDeleteOneRecord = <T>({
  objectNameSingular,
  refetchFindManyQuery = false,
}: useDeleteOneRecordProps) => {
  const { performOptimisticEvict } = useOptimisticEvict();
  const { triggerOptimisticEffects } = useOptimisticEffect({
    objectNameSingular,
  });

  const { objectMetadataItem, deleteOneRecordMutation, findManyRecordsQuery } =
    useObjectMetadataItem({
      objectNameSingular,
    });

  const apolloClient = useApolloClient();

  const deleteOneRecord = useCallback(
    async (idToDelete: string) => {
      triggerOptimisticEffects({
        typename: `${capitalize(objectMetadataItem.nameSingular)}Edge`,
        deletedRecordIds: [idToDelete],
      });

      performOptimisticEvict(
        capitalize(objectMetadataItem.nameSingular),
        'id',
        idToDelete,
      );

      const deletedRecord = await apolloClient.mutate({
        mutation: deleteOneRecordMutation,
        variables: {
          idToDelete,
        },
        refetchQueries: refetchFindManyQuery
          ? [getOperationName(findManyRecordsQuery) ?? '']
          : [],
      });

      return deletedRecord.data[
        `create${capitalize(objectMetadataItem.nameSingular)}`
      ] as T;
    },
    [
      triggerOptimisticEffects,
      objectMetadataItem.nameSingular,
      performOptimisticEvict,
      apolloClient,
      deleteOneRecordMutation,
      refetchFindManyQuery,
      findManyRecordsQuery,
    ],
  );

  return {
    deleteOneRecord,
  };
};
