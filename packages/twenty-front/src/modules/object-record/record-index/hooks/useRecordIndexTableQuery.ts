import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { getObjectRelationFields } from '@/object-record/record-relations/utils/getObjectRelationFields';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ViewType } from '@/views/types/ViewType';

export const useRecordIndexTableQuery = (objectNameSingular: string) => {
  const params = useFindManyRecordIndexTableParams(objectNameSingular);
  const recordIndexViewType = useAtomStateValue(recordIndexViewTypeState);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const additionalFieldMetadataIds =
    recordIndexViewType === ViewType.RELATIONS
      ? getObjectRelationFields(objectMetadataItem).map((field) => field.id)
      : [];

  const recordGqlFields = useRelevantRecordsGqlFields({
    objectMetadataItem,
    additionalFieldMetadataIds,
  });

  const {
    records,
    hasNextPage,
    queryIdentifier,
    loading,
    error,
    totalCount,
    fetchMoreRecords,
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
  };
};
