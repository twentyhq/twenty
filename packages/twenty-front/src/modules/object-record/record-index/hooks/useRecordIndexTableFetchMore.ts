import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useRecordsFieldVisibleGqlFields } from '@/object-record/record-field/hooks/useRecordsFieldVisibleGqlFields';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';

export const useRecordIndexTableFetchMore = (objectNameSingular: string) => {
  const params = useFindManyRecordIndexTableParams(objectNameSingular);

  const recordGqlFields = useRecordsFieldVisibleGqlFields();

  const { fetchMoreRecordsLazy, queryIdentifier } = useLazyFindManyRecords({
    ...params,
    recordGqlFields,
  });

  return {
    fetchMoreRecordsLazy,
    queryIdentifier,
  };
};
