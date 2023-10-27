import { useQuery } from '@apollo/client';

import { MetadataObjectIdentifier } from '../types/MetadataObjectIdentifier';

import { useFindOneMetadataObject } from './useFindOneMetadataObject';

export const useFindOneObject = <
  ObjectType extends { id: string } & Record<string, any>,
>({
  objectNameSingular,
  objectId,
  onCompleted,
}: Pick<MetadataObjectIdentifier, 'objectNameSingular'> & {
  objectId: string | undefined;
  onCompleted?: (data: ObjectType) => void;
}) => {
  const { foundMetadataObject, objectNotFoundInMetadata, findOneQuery } =
    useFindOneMetadataObject({
      objectNameSingular,
    });

  const { data, loading, error } = useQuery<
    { [nameSingular: string]: ObjectType },
    { objectId: string }
  >(findOneQuery, {
    skip: !foundMetadataObject || !objectId,
    variables: {
      objectId: objectId ?? '',
    },
    onCompleted: (data) => {
      if (onCompleted && objectNameSingular) {
        onCompleted(data[objectNameSingular]);
      }
    },
  });

  const object =
    objectNameSingular && data ? data[objectNameSingular] : undefined;

  return {
    object,
    loading,
    error,
    objectNotFoundInMetadata,
  };
};
