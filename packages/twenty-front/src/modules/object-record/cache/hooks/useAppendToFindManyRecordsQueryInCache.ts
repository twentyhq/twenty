import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useReadFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useReadFindManyRecordsQueryInCache';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';

export const useAppendToFindManyRecordsQueryInCache = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { readFindManyRecordsQueryInCache } =
    useReadFindManyRecordsQueryInCache({
      objectMetadataItem,
    });

  const {
    upsertFindManyRecordsQueryInCache: overwriteFindManyRecordsQueryInCache,
  } = useUpsertFindManyRecordsQueryInCache({
    objectMetadataItem,
  });

  const appendToFindManyRecordsQueryInCache = <
    T extends ObjectRecord = ObjectRecord,
  >({
    queryVariables,
    objectRecordsToAppend,
  }: {
    queryVariables: ObjectRecordQueryVariables;
    objectRecordsToAppend: T[];
  }) => {
    const existingObjectRecords = readFindManyRecordsQueryInCache({
      queryVariables,
    });

    const newObjectRecordList = [
      ...existingObjectRecords,
      ...objectRecordsToAppend,
    ];

    overwriteFindManyRecordsQueryInCache({
      objectRecordsToOverwrite: newObjectRecordList,
      queryVariables,
    });
  };

  return {
    appendToFindManyRecordsQueryInCache,
  };
};
