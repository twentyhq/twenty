import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { recordIndexListPinnedFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexListPinnedFieldMetadataIdComponentState';
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

  const recordIndexListPinnedFieldMetadataId = useAtomComponentStateValue(
    recordIndexListPinnedFieldMetadataIdComponentState,
  );

  const recordGqlFields = useRelevantRecordsGqlFields({
    objectMetadataItem,
    additionalFieldMetadataIds: [
      recordIndexGroupFieldMetadataItem?.id,
      recordIndexListPinnedFieldMetadataId,
    ],
  });

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
