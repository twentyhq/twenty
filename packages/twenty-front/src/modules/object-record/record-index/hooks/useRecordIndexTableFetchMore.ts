import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useRecordFieldGqlFields } from '@/object-record/record-field/hooks/useRecordFieldGqlFields';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';

export const useRecordIndexTableFetchMore = (objectNameSingular: string) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const params = useFindManyRecordIndexTableParams(objectNameSingular);

  const recordGqlFields = useRecordFieldGqlFields({ objectMetadataItem });

  const { fetchMoreRecordsLazy, queryIdentifier } = useLazyFindManyRecords({
    ...params,
    recordGqlFields,
  });

  return {
    fetchMoreRecordsLazy,
    queryIdentifier,
  };
};
