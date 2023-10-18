import { gql, useMutation } from '@apollo/client';

import { generateCreateOneObjectMutation } from '../utils/generateCreateOneObjectMutation';

import { useFindManyMetadataObjects } from './useFindManyMetadataObjects';

export const useCreateOneObject = ({
  objectNamePlural,
}: {
  objectNamePlural: string;
}) => {
  const { metadataObjects } = useFindManyMetadataObjects();

  const foundMetadataObject = metadataObjects.find(
    (object) => object.namePlural === objectNamePlural,
  );

  const generatedMutation = foundMetadataObject
    ? generateCreateOneObjectMutation({
        metadataObject: foundMetadataObject,
      })
    : gql`
        mutation EmptyMutation {
          empty
        }
      `;

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

  const objectNotFoundInMetadata =
    metadataObjects.length > 0 && !foundMetadataObject;

  return {
    createOneObject,
    objectNotFoundInMetadata,
  };
};
