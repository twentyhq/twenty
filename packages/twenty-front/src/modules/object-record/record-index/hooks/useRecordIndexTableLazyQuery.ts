import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { useRecordIndexTableColumnQuery } from '@/object-record/record-index/hooks/useRecordIndexTableColumnQuery';

export const useRecordIndexTableLazyQuery = (objectNameSingular: string) => {
  const params = useFindManyRecordIndexTableParams(objectNameSingular);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { recordGqlFields, relationAliases, columnQueryFingerprint } =
    useRecordIndexTableColumnQuery(objectMetadataItem);

  const { fetchMoreRecordsLazy, queryIdentifier, findManyRecordsLazy } =
    useLazyFindManyRecords({
      ...params,
      recordGqlFields,
      relationAliases,
    });

  return {
    findManyRecordsLazy,
    fetchMoreRecordsLazy,
    // A column's scope changes loaded cells without changing the filter or sort
    queryIdentifier: `${queryIdentifier}${columnQueryFingerprint}`,
  };
};
