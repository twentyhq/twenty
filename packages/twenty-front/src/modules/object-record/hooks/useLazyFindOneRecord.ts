import { useLazyQuery } from '@apollo/client';

import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

type UseLazyFindOneRecordParams = ObjectMetadataItemIdentifier & {
  depth?: number;
};

type FindOneRecordParams<T extends ObjectRecord> = {
  objectRecordId: string | undefined;
  onCompleted?: (data: T) => void;
};

export const useLazyFindOneRecord = <T extends ObjectRecord = ObjectRecord>({
  objectNameSingular,
  depth,
}: UseLazyFindOneRecordParams) => {
  const { findOneRecordQuery } = useFindOneRecordQuery({
    objectNameSingular,
    depth,
  });

  const [findOneRecord, { loading, error, data, called }] =
    useLazyQuery(findOneRecordQuery);

  return {
    findOneRecord: ({ objectRecordId, onCompleted }: FindOneRecordParams<T>) =>
      findOneRecord({
        variables: { objectRecordId },
        onCompleted: (data) => onCompleted?.(data[objectNameSingular]),
      }),
    called,
    error,
    loading,
    record: data?.[objectNameSingular] || undefined,
  };
};
