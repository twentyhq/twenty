import { useQuery } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';

export const useFindOneObjectRecord = <
  ObjectType extends { id: string } & Record<string, any>,
>({
  objectNameSingular,
  objectRecordId,
  onCompleted,
  skip,
}: Pick<ObjectMetadataItemIdentifier, 'objectNameSingular'> & {
  objectRecordId: string | undefined;
  onCompleted?: (data: ObjectType) => void;
  skip?: boolean;
}) => {
  const { objectMetadataItem: foundObjectMetadataItem, objectNotFoundInMetadata, findOneQuery } =
    useObjectMetadataItem({
      objectNameSingular,
    });

  const { data, loading, error } = useQuery<
    { [nameSingular: string]: ObjectType },
    { objectRecordId: string }
  >(findOneQuery, {
    skip: !foundObjectMetadataItem || !objectRecordId || skip,
    variables: {
      objectRecordId: objectRecordId ?? '',
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
