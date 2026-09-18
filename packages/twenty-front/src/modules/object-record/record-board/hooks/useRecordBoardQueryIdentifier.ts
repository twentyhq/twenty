import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';

export const useRecordBoardQueryIdentifier = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const { combinedFilters, orderBy, recordGqlFields } =
    useRecordIndexGroupCommonQueryVariables();

  // Newly shown fields are only fetched when this identifier changes
  const fetchedFieldNames = Object.keys(recordGqlFields).sort().join(',');

  return (
    getQueryIdentifier({
      objectNameSingular: objectMetadataItem.nameSingular,
      filter: combinedFilters,
      orderBy,
    }) + fetchedFieldNames
  );
};
