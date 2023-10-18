import { gql, useMutation } from '@apollo/client';

import { MetadataObjectIdentifier } from '../types/MetadataObjectIdentifier';
import { generateUpdateOneObjectMutation } from '../utils/generateUpdateOneObjectMutation';

import { useFindOneMetadataObject } from './useFindOneMetadataObject';

export const useUpdateOneObject = ({
  objectNamePlural,
}: MetadataObjectIdentifier) => {
  const { foundMetadataObject, objectNotFoundInMetadata } =
    useFindOneMetadataObject({
      objectNamePlural,
    });

  const generatedMutation = foundMetadataObject
    ? generateUpdateOneObjectMutation({
        metadataObject: foundMetadataObject,
      })
    : gql`
        mutation EmptyMutation {
          empty
        }
      `;

  // TODO: type this with a minimal type at least with Record<string, any>
  const [mutate] = useMutation(generatedMutation);

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
