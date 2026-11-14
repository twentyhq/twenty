import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useScopedRelationAliases } from '@/object-record/record-column-scope/hooks/useScopedRelationAliases';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';

export const useRecordIndexTableLazyQuery = (objectNameSingular: string) => {
  const params = useFindManyRecordIndexTableParams(objectNameSingular);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const recordGqlFields = useRelevantRecordsGqlFields({
    objectMetadataItem,
  });

  const relationAliases = useScopedRelationAliases();

  const { fetchMoreRecordsLazy, queryIdentifier, findManyRecordsLazy } =
    useLazyFindManyRecords({
      ...params,
      recordGqlFields,
      relationAliases,
    });

  return {
    findManyRecordsLazy,
    fetchMoreRecordsLazy,
    queryIdentifier,
  };
};
