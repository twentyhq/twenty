import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useRecordsUsefulGqlFields } from '@/object-record/record-field/hooks/useRecordsUsefulGqlFields';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';

export const useRecordIndexTableFetchMore = (objectNameSingular: string) => {
  const params = useFindManyRecordIndexTableParams(objectNameSingular);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const recordGqlFields = useRecordsUsefulGqlFields({
    objectMetadataItem,
  });

  const { fetchMoreRecordsLazy, queryIdentifier, findManyRecordsLazy } =
    useLazyFindManyRecords({
      ...params,
      recordGqlFields,
    });

  return {
    findManyRecordsLazy,
    fetchMoreRecordsLazy,
    queryIdentifier,
  };
};
