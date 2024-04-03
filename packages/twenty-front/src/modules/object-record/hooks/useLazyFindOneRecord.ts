import { useLazyQuery } from '@apollo/client';

import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { useGenerateFindOneRecordQuery } from '@/object-record/hooks/useGenerateFindOneRecordQuery';
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
  const { objectMetadataItem } = useObjectMetadataItemOnly({
    objectNameSingular,
  });
  const findOneRecordQuery = useGenerateFindOneRecordQuery();

  const [findOneRecord, { loading, error, data, called }] = useLazyQuery(
    findOneRecordQuery({ objectMetadataItem, depth }),
  );

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
