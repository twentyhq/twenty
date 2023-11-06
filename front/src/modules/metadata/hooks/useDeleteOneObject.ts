import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { ObjectMetadataItemIdentifier } from '../types/ObjectMetadataItemIdentifier';

import { useFindOneObjectMetadataItem } from './useFindOneObjectMetadataItem';

export const useDeleteOneObject = ({
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
    ? (input: Record<string, any>) => {
        return mutate({
          variables: {
            input: {
              ...input,
            },
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
