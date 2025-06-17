import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { useRecordTableRecordGqlFields } from '@/object-record/record-index/hooks/useRecordTableRecordGqlFields';

export const useRecordIndexTableQuery = (objectNameSingular: string) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const params = useFindManyRecordIndexTableParams(objectNameSingular);

  const recordGqlFields = useRecordTableRecordGqlFields({ objectMetadataItem });

  const { records, hasNextPage, queryIdentifier, loading } = useFindManyRecords(
    {
      ...params,
      recordGqlFields,
    },
  );

  return {
    records,
    loading,
    hasNextPage,
    queryIdentifier,
  };
};
