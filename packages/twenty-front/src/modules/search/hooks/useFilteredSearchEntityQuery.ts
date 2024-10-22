import { useMapToObjectRecordIdentifier } from '@/object-metadata/hooks/useMapToObjectRecordIdentifier';
import { DEFAULT_SEARCH_REQUEST_LIMIT } from '@/object-record/constants/DefaultSearchRequestLimit';
import { useSearchRecords } from '@/object-record/hooks/useSearchRecords';
import { EntitiesForMultipleEntitySelect } from '@/object-record/relation-picker/types/EntitiesForMultipleEntitySelect';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';

// TODO: use this for all search queries, because we need selectedEntities and entitiesToSelect each time we want to search
// Filtered entities to select are

export const useFilteredSearchEntityQuery = ({
  selectedIds,
  limit,
  excludeRecordIds = [],
  objectNameSingular,
  searchFilter,
}: {
  selectedIds: string[];
  limit?: number;
  excludeRecordIds?: string[];
  objectNameSingular: string;
  searchFilter?: string;
}): EntitiesForMultipleEntitySelect<EntityForSelect> => {
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

  const notFilterIds = [...selectedIds, ...excludeRecordIds];
  const notFilter = notFilterIds.length
    ? { not: { id: { in: notFilterIds } } }
    : undefined;
  const { loading: recordsToSelectLoading, records: recordsToSelect } =
    useSearchRecords({
      objectNameSingular,
      filter: notFilter,
      limit: limit ?? DEFAULT_SEARCH_REQUEST_LIMIT,
      searchInput: searchFilter,
    });

  return {
    selectedEntities: selectedRecords.map(mappingFunction).filter(isDefined),
    filteredSelectedEntities: filteredSelectedRecords
      .map(mappingFunction)
      .filter(isDefined),
    entitiesToSelect: recordsToSelect.map(mappingFunction).filter(isDefined),
    loading:
      recordsToSelectLoading ||
      filteredSelectedRecordsLoading ||
      selectedRecordsLoading,
  };
};
