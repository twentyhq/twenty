import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useScopedRelationAliases } from '@/object-record/record-column-scope/hooks/useScopedRelationAliases';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const useRecordIndexTableQuery = (objectNameSingular: string) => {
  const params = useFindManyRecordIndexTableParams(objectNameSingular);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordGqlFields = useRelevantRecordsGqlFields({
    objectMetadataItem,
    additionalFieldMetadataIds: [recordIndexGroupFieldMetadataItem?.id],
  });

  const relationAliases = useScopedRelationAliases();

  const {
    records,
    hasNextPage,
    queryIdentifier,
    loading,
    error,
    totalCount,
    fetchMoreRecords,
    refetch,
  } = useFindManyRecords({
    ...params,
    recordGqlFields,
    relationAliases,
  });

  return {
    records,
    loading,
    error,
    hasNextPage,
    queryIdentifier,
    totalCount,
    fetchMoreRecords,
    refetch,
  };
};
