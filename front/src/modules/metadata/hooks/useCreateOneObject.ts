import { gql, useMutation } from '@apollo/client';

import { MetadataObjectIdentifier } from '../types/MetadataObjectIdentifier';
import { generateCreateOneObjectMutation } from '../utils/generateCreateOneObjectMutation';

import { useFindOneMetadataObject } from './useFindOneMetadataObject';

export const useCreateOneObject = ({
  objectNamePlural,
}: MetadataObjectIdentifier) => {
  const { foundMetadataObject, objectNotFoundInMetadata } =
    useFindOneMetadataObject({
      objectNamePlural,
    });

  const generatedMutation = foundMetadataObject
    ? generateCreateOneObjectMutation({
        metadataObject: foundMetadataObject,
      })
    : gql`
        mutation EmptyMutation {
          empty
        }
      `;

  // TODO: type this with a minimal type at least with Record<string, any>
  const [mutate] = useMutation(generatedMutation);

  const createOneObject = foundMetadataObject
    ? (input: Record<string, any>) => {
        return mutate({
          variables: {
            input: {
              ...input,
            },
          },
        });
      }
    : undefined;

  return {
    createOneObject,
    objectNotFoundInMetadata,
  };
};
