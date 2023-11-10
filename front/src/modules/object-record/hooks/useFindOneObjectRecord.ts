import { useQuery } from '@apollo/client';

import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';

export const useFindOneObjectRecord = <
  ObjectType extends { id: string } & Record<string, any>,
>({
  objectNameSingular,
  objectMetadataId,
  onCompleted,
}: Pick<ObjectMetadataItemIdentifier, 'objectNameSingular'> & {
  objectMetadataId: string | undefined;
  onCompleted?: (data: ObjectType) => void;
}) => {
  const { foundObjectMetadataItem, objectNotFoundInMetadata, findOneQuery } =
    useFindOneObjectMetadataItem({
      objectNameSingular,
    });

  const { data, loading, error } = useQuery<
    { [nameSingular: string]: ObjectType },
    { objectMetadataId: string }
  >(findOneQuery, {
    skip: !foundObjectMetadataItem || !objectMetadataId,
    variables: {
      objectMetadataId: objectMetadataId ?? '',
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
