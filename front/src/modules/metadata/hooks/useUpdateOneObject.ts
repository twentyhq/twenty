import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { ObjectMetadataItemIdentifier } from '../types/ObjectMetadataItemIdentifier';

import { useFindOneObjectMetadataItem } from './useFindOneObjectMetadataItem';

export const useUpdateOneObject = ({
  objectNamePlural,
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  const {
    foundObjectMetadataItem,
    objectNotFoundInMetadata,
    findManyQuery,
    updateOneMutation,
  } = useFindOneObjectMetadataItem({
    objectNamePlural,
    objectNameSingular,
  });

  // TODO: type this with a minimal type at least with Record<string, any>
  const [mutate] = useMutation(updateOneMutation, {
    refetchQueries: [getOperationName(findManyQuery) ?? ''],
  });

  const updateOneObject = foundObjectMetadataItem
    ? ({
        idToUpdate,
        input,
      }: {
        idToUpdate: string;
        input: Record<string, any>;
      }) => {
        return mutate({
          variables: {
            idToUpdate: idToUpdate,
            input: {
              ...input,
            },
          },
        });
      }
    : undefined;

  return {
    updateOneObject,
    objectNotFoundInMetadata,
  };
};
