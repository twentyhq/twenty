import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { MetadataObjectIdentifier } from '../types/MetadataObjectIdentifier';

import { useFindOneMetadataObject } from './useFindOneMetadataObject';

export const useUpdateOneObject = ({
  objectNamePlural,
  objectNameSingular,
}: MetadataObjectIdentifier) => {
  const {
    foundMetadataObject,
    objectNotFoundInMetadata,
    findManyQuery,
    updateOneMutation,
  } = useFindOneMetadataObject({
    objectNamePlural,
    objectNameSingular,
  });

  // TODO: type this with a minimal type at least with Record<string, any>
  const [mutate] = useMutation(updateOneMutation, {
    refetchQueries: [getOperationName(findManyQuery) ?? ''],
  });

  const updateOneObject = foundMetadataObject
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
