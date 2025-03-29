import { formatSearchRecordAsSingleRecordPickerRecord } from '@/object-metadata/utils/formatSearchRecordAsSingleRecordPickerRecord';
import { DEFAULT_SEARCH_REQUEST_LIMIT } from '@/object-record/constants/DefaultSearchRequestLimit';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { isDefined } from 'twenty-shared/utils';

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
}): {
  selectedRecords: SingleRecordPickerRecord[];
  filteredSelectedRecords: SingleRecordPickerRecord[];
  recordsToSelect: SingleRecordPickerRecord[];
  loading: boolean;
} => {
  const selectedIdsFilter = { id: { in: selectedIds } };

  const { loading: selectedRecordsLoading, searchRecords: selectedRecords } =
    useObjectRecordSearchRecords({
      objectNameSingular,
      filter: selectedIdsFilter,
      skip: !selectedIds.length,
      searchInput: '',
    });

  const {
    loading: filteredSelectedRecordsLoading,
    searchRecords: filteredSelectedRecords,
  } = useObjectRecordSearchRecords({
    objectNameSingular,
    filter: selectedIdsFilter,
    skip: !selectedIds.length,
    searchInput: searchFilter,
  });

  const notFilterIds = [...selectedIds, ...excludedRecordIds];
  const notFilter = notFilterIds.length
    ? { not: { id: { in: notFilterIds } } }
    : undefined;
  const { loading: recordsToSelectLoading, searchRecords: recordsToSelect } =
    useObjectRecordSearchRecords({
      objectNameSingular,
      filter: notFilter,
      limit: limit ?? DEFAULT_SEARCH_REQUEST_LIMIT,
      searchInput: searchFilter,
      fetchPolicy: 'cache-and-network',
    });

  return {
    selectedRecords: selectedRecords
      .map(formatSearchRecordAsSingleRecordPickerRecord)
      .filter(isDefined),
    filteredSelectedRecords: filteredSelectedRecords
      .map(formatSearchRecordAsSingleRecordPickerRecord)
      .filter(isDefined),
    recordsToSelect: recordsToSelect
      .map(formatSearchRecordAsSingleRecordPickerRecord)
      .filter(isDefined),
    loading:
      recordsToSelectLoading ||
      filteredSelectedRecordsLoading ||
      selectedRecordsLoading,
  };
};
