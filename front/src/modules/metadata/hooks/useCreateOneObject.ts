import { gql, useMutation } from '@apollo/client';

import { generateCreateOneObjectMutation } from '../utils/generateCreateOneObjectMutation';

import { useFindManyMetadataObjects } from './useFindManyMetadataObjects';

export const useCreateOneObject = <ObjectType extends { id: string }>({
  objectNamePlural,
}: {
  objectNamePlural: string;
}) => {
  const { metadataObjects } = useFindManyMetadataObjects();

  const foundMetadataObject = metadataObjects.find(
    (object) => object.namePlural === objectNamePlural,
  );

  // eslint-disable-next-line no-console
  console.log({ metadataObjects, foundMetadataObject });

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

  const objectNotFoundInMetadata =
    metadataObjects.length > 0 && !foundMetadataObject;

  return {
    mutate,
    objectNotFoundInMetadata,
  };
};
