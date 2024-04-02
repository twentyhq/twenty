import { useMemo } from 'react';
import { useQuery } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';

// TODO: fix connection in relation => automatically change to an array
export const useFindOneRecord = <T extends ObjectRecord = ObjectRecord>({
  objectNameSingular,
  objectRecordId = '',
  onCompleted,
  depth,
  skip,
}: ObjectMetadataItemIdentifier & {
  objectRecordId: string | undefined;
  onCompleted?: (data: T) => void;
  skip?: boolean;
  depth?: number;
}) => {
  const { objectMetadataItem, findOneRecordQuery } = useObjectMetadataItem(
    { objectNameSingular },
    depth,
  );

  const { data, loading, error } = useQuery<
    { [nameSingular: string]: T },
    { objectRecordId: string }
  >(findOneRecordQuery, {
    skip: !objectMetadataItem || !objectRecordId || skip,
    variables: { objectRecordId },
    onCompleted: (data) => {
      const recordWithoutConnection = getRecordFromRecordNode({
        recordNode: { ...data[objectNameSingular] },
      });

      if (isDefined(recordWithoutConnection)) {
        onCompleted?.(recordWithoutConnection);
      }
    },
  });

  const recordWithoutConnection = useMemo(
    () =>
      data?.[objectNameSingular]
        ? getRecordFromRecordNode({
            recordNode: data?.[objectNameSingular],
          })
        : undefined,
    [data, objectNameSingular],
  );

  return {
    record: recordWithoutConnection,
    loading,
    error,
  };
};
