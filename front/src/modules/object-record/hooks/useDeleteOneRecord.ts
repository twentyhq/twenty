import { useCallback } from 'react';
import { useMutation } from '@apollo/client';

import { useOptimisticEvict } from '@/apollo/optimistic-effect/hooks/useOptimisticEvict';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { capitalize } from '~/utils/string/capitalize';

export const useDeleteOneRecord = <T>({
  objectNameSingular,
}: Pick<ObjectMetadataItemIdentifier, 'objectNameSingular'>) => {
  const { performOptimisticEvict } = useOptimisticEvict();

  const {
    objectMetadataItem,
    objectMetadataItemNotFound,
    deleteOneRecordMutation,
  } = useObjectMetadataItem({
    objectNameSingular,
  });

  // TODO: type this with a minimal type at least with Record<string, any>
  const [mutate] = useMutation(deleteOneRecordMutation);

  const deleteOneRecord = useCallback(
    async (idToDelete: string) => {
      if (!objectMetadataItem || !objectNameSingular) {
        return null;
      }

      const deletedRecord = await mutate({
        variables: {
          idToDelete,
        },
      });

      performOptimisticEvict(capitalize(objectNameSingular), 'id', idToDelete);

      return deletedRecord.data[`create${capitalize(objectNameSingular)}`] as T;
    },
    [performOptimisticEvict, objectMetadataItem, mutate, objectNameSingular],
  );

  return {
    deleteOneRecord,
    objectMetadataItemNotFound,
  };
};
