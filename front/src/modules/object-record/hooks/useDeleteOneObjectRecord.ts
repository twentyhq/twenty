import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';

export const useDeleteOneObjectRecord = ({
  objectNamePlural,
}: Pick<ObjectMetadataItemIdentifier, 'objectNamePlural'>) => {
  const {
    foundObjectMetadataItem,
    objectNotFoundInMetadata,
    findManyQuery,
    deleteOneMutation,
  } = useFindOneObjectMetadataItem({
    objectNamePlural,
  });

  // TODO: type this with a minimal type at least with Record<string, any>
  const [mutate] = useMutation(deleteOneMutation);

  const deleteOneObject = foundObjectMetadataItem
    ? (idToDelete: string) => {
        return mutate({
          variables: {
            idToDelete,
          },
          refetchQueries: [getOperationName(findManyQuery) ?? ''],
        });
      }
    : undefined;

  return {
    deleteOneObject,
    objectNotFoundInMetadata,
  };
};
