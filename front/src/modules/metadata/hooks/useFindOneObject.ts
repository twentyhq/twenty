import { useQuery } from '@apollo/client';

import { ObjectMetadataItemIdentifier } from '../types/ObjectMetadataItemIdentifier';

import { useFindOneObjectMetadataItem } from './useFindOneObjectMetadataItem';

export const useFindOneObject = <
  ObjectType extends { id: string } & Record<string, any>,
>({
  objectNameSingular,
  objectId,
  onCompleted,
}: Pick<ObjectMetadataItemIdentifier, 'objectNameSingular'> & {
  objectId: string | undefined;
  onCompleted?: (data: ObjectType) => void;
}) => {
  const { foundObjectMetadataItem, objectNotFoundInMetadata, findOneQuery } =
    useFindOneObjectMetadataItem({
      objectNameSingular,
    });

  const { data, loading, error } = useQuery<
    { [nameSingular: string]: ObjectType },
    { objectId: string }
  >(findOneQuery, {
    skip: !foundObjectMetadataItem || !objectId,
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
