import { useMapToObjectRecordIdentifier } from '@/object-metadata/hooks/useMapToObjectRecordIdentifier';
import { DEFAULT_SEARCH_REQUEST_LIMIT } from '@/object-record/constants/DefaultSearchRequestLimit';
import { useSearchRecords } from '@/object-record/hooks/useSearchRecords';
import { RecordForSelect } from '@/object-record/relation-picker/types/RecordForSelect';
import { RecordsForMultipleRecordSelect } from '@/object-record/relation-picker/types/RecordsForMultipleRecordSelect';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';

// TODO: use this for all search queries, because we need selectedRecords and recordsToSelect each time we want to search
// Filtered entities to select are

export const useFilteredSearchRecordQuery = ({
  selectedIds,
  limit,
  excludedRecordIds = [],
  objectNameSingular,
  searchFilter,
}: {
  selectedIds: string[];
  limit?: number;
  excludedRecordIds?: string[];
  objectNameSingular: string;
  searchFilter?: string;
}): RecordsForMultipleRecordSelect<RecordForSelect> => {
  const { mapToObjectRecordIdentifier } = useMapToObjectRecordIdentifier({
    objectNameSingular,
  });

  const mappingFunction = (record: ObjectRecord) => ({
    ...mapToObjectRecordIdentifier(record),
    record,
  });
  const selectedIdsFilter = { id: { in: selectedIds } };

  const { loading: selectedRecordsLoading, records: selectedRecords } =
    useSearchRecords({
      objectNameSingular,
      filter: selectedIdsFilter,
      skip: !selectedIds.length,
      searchInput: searchFilter,
    });

  const {
    loading: filteredSelectedRecordsLoading,
    records: filteredSelectedRecords,
  } = useSearchRecords({
    objectNameSingular,
    filter: selectedIdsFilter,
    skip: !selectedIds.length,
    searchInput: searchFilter,
  });

  const notFilterIds = [...selectedIds, ...excludedRecordIds];
  const notFilter = notFilterIds.length
    ? { not: { id: { in: notFilterIds } } }
    : undefined;
  const { loading: recordsToSelectLoading, records: recordsToSelect } =
    useSearchRecords({
      objectNameSingular,
      filter: notFilter,
      limit: limit ?? DEFAULT_SEARCH_REQUEST_LIMIT,
      searchInput: searchFilter,
      fetchPolicy: 'cache-and-network',
    });

  return {
    selectedRecords: selectedRecords.map(mappingFunction).filter(isDefined),
    filteredSelectedRecords: filteredSelectedRecords
      .map(mappingFunction)
      .filter(isDefined),
    recordsToSelect: recordsToSelect.map(mappingFunction).filter(isDefined),
    loading:
      recordsToSelectLoading ||
      filteredSelectedRecordsLoading ||
      selectedRecordsLoading,
  };
};
