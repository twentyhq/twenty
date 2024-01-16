import { useMemo } from 'react';
import { useQuery } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { useGetRecordFromCache } from '@/object-record/hooks/useGetRecordFromCache';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useFindOneRecord = <ObjectType extends ObjectRecord>({
  objectNameSingular,
  objectRecordId = '',
  onCompleted,
  depth,
  skip,
}: ObjectMetadataItemIdentifier & {
  objectRecordId: string | undefined;
  onCompleted?: (data: ObjectType) => void;
  skip?: boolean;
  depth?: number;
}) => {
  const { objectMetadataItem, findOneRecordQuery } = useObjectMetadataItem(
    { objectNameSingular },
    depth,
  );

  const getRecordFromCache = useGetRecordFromCache<ObjectType>({
    objectMetadataItem,
  });
  const recordFromCache = useMemo(
    () => getRecordFromCache(objectRecordId),
    [getRecordFromCache, objectRecordId],
  );

  const { data, loading, error } = useQuery<
    { [nameSingular: string]: ObjectType },
    { objectRecordId: string }
  >(findOneRecordQuery, {
    skip: !objectMetadataItem || !objectRecordId || !!recordFromCache || skip,
    variables: { objectRecordId },
    onCompleted: (data) => onCompleted?.(data[objectNameSingular]),
  });

  return {
    record: recordFromCache || data?.[objectNameSingular] || undefined,
    loading,
    error,
  };
};
