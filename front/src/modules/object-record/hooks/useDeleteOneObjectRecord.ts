import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { capitalize } from '~/utils/string/capitalize';

export const useDeleteOneObjectRecord = <T>({
  objectNameSingular,
}: Pick<ObjectMetadataItemIdentifier, 'objectNameSingular'>) => {
  const {
    objectMetadataItem: foundObjectMetadataItem,
    objectNotFoundInMetadata,
    findManyQuery,
    deleteOneMutation,
  } = useObjectMetadataItem({
    objectNameSingular,
  });

  // TODO: type this with a minimal type at least with Record<string, any>
  const [mutate] = useMutation(deleteOneMutation);

  const deleteOneObject =
    objectNameSingular && foundObjectMetadataItem
      ? async (idToDelete: string) => {
          const deletedObject = await mutate({
            variables: {
              idToDelete,
            },
            refetchQueries: [getOperationName(findManyQuery) ?? ''],
          });
          return deletedObject.data[
            `create${capitalize(objectNameSingular)}`
          ] as T;
        }
      : undefined;

  return {
    deleteOneObject,
    objectNotFoundInMetadata,
  };
};
