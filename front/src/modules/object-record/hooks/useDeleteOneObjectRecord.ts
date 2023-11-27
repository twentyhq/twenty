import { useCallback } from 'react';
import { useMutation } from '@apollo/client';

import { useOptimisticEvict } from '@/apollo/optimistic-effect/hooks/useOptimisticEvict';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { capitalize } from '~/utils/string/capitalize';

export const useDeleteOneObjectRecord = <T>({
  objectNameSingular,
}: Pick<ObjectMetadataItemIdentifier, 'objectNameSingular'>) => {
  const { performOptimisticEvict } = useOptimisticEvict();

  const {
    objectMetadataItem: foundObjectMetadataItem,
    objectNotFoundInMetadata,
    deleteOneMutation,
  } = useObjectMetadataItem({
    objectNameSingular,
  });

  // TODO: type this with a minimal type at least with Record<string, any>
  const [mutate] = useMutation(deleteOneMutation);

  const deleteOneObject = useCallback(
    async (idToDelete: string) => {
      if (!foundObjectMetadataItem || !objectNameSingular) {
        return null;
      }

      const deletedObject = await mutate({
        variables: {
          idToDelete,
        },
      });

      performOptimisticEvict(capitalize(objectNameSingular), 'id', idToDelete);

      return deletedObject.data[`create${capitalize(objectNameSingular)}`] as T;
    },
    [
      performOptimisticEvict,
      foundObjectMetadataItem,
      mutate,
      objectNameSingular,
    ],
  );

  return {
    deleteOneObject,
    objectNotFoundInMetadata,
  };
};
