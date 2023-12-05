import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useOptimisticEvict } from '@/apollo/optimistic-effect/hooks/useOptimisticEvict';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { capitalize } from '~/utils/string/capitalize';

export const useDeleteOneRecord = <T>({
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  const { performOptimisticEvict } = useOptimisticEvict();
  const { triggerOptimisticEffects } = useOptimisticEffect({
    objectNameSingular,
  });

  const { objectMetadataItem, deleteOneRecordMutation } = useObjectMetadataItem(
    {
      objectNameSingular,
    },
  );

  const apolloClient = useApolloClient();

  const deleteOneRecord = useCallback(
    async (idToDelete: string) => {
      triggerOptimisticEffects(
        `${capitalize(objectMetadataItem.nameSingular)}Edge`,
        undefined,
        [idToDelete],
      );

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
    ],
  );

  return {
    deleteOneRecord,
  };
};
