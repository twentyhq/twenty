import { isNonEmptyString } from '@sniptt/guards';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { OrderBy } from '@/object-metadata/types/OrderBy';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { EntitiesForMultipleEntitySelect } from '@/object-record/relation-picker/types/EntitiesForMultipleEntitySelect';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { andFilterVariables } from '@/object-record/utils/andFilterVariables';
import { orFilterVariables } from '@/object-record/utils/orFilterVariables';
import { assertNotNull } from '~/utils/assert';

type SearchFilter = { fieldNames: string[]; filter: string | number };

export const DEFAULT_SEARCH_REQUEST_LIMIT = 60;

// TODO: use this for all search queries, because we need selectedEntities and entitiesToSelect each time we want to search
// Filtered entities to select are

export const useFilteredSearchEntityQuery = ({
  orderByField,
  filters,
  sortOrder = 'AscNullsLast',
  selectedIds,
  limit,
  excludeEntityIds = [],
  objectNameSingular,
}: {
  orderByField: string;
  filters: SearchFilter[];
  sortOrder?: OrderBy;
  selectedIds: string[];
  limit?: number;
  excludeEntityIds?: string[];
  objectNameSingular: string;
}): EntitiesForMultipleEntitySelect<EntityForSelect> => {
  const { mapToObjectRecordIdentifier } = useObjectMetadataItem({
    objectNameSingular,
  });
  const mappingFunction = (record: ObjectRecord) => ({
    ...mapToObjectRecordIdentifier(record),
    record,
  });
  const selectedIdsFilter = { id: { in: selectedIds } };

  const { loading: selectedRecordsLoading, records: selectedRecords } =
    useFindManyRecords({
      objectNameSingular,
      filter: selectedIdsFilter,
      orderBy: { [orderByField]: sortOrder },
      skip: !selectedIds.length,
    });

  const searchFilters = filters.map(({ fieldNames, filter }) => {
    if (!isNonEmptyString(filter)) {
      return undefined;
    }

    return orFilterVariables(
      fieldNames.map((fieldName) => {
        const [parentFieldName, subFieldName] = fieldName.split('.');

        if (subFieldName) {
          // Composite field
          return {
            [parentFieldName]: {
              [subFieldName]: {
                ilike: `%${filter}%`,
              },
            },
          };
        }

        return {
          [fieldName]: {
            ilike: `%${filter}%`,
          },
        };
      }),
    );
  });

  const {
    loading: filteredSelectedRecordsLoading,
    records: filteredSelectedRecords,
  } = useFindManyRecords({
    objectNameSingular,
    filter: andFilterVariables([...searchFilters, selectedIdsFilter]),
    orderBy: { [orderByField]: sortOrder },
    skip: !selectedIds.length,
  });

  const notFilterIds = [...selectedIds, ...excludeEntityIds];
  const notFilter = notFilterIds.length
    ? { not: { id: { in: notFilterIds } } }
    : undefined;
  const { loading: recordsToSelectLoading, records: recordsToSelect } =
    useFindManyRecords({
      objectNameSingular,
      filter: andFilterVariables([...searchFilters, notFilter]),
      limit: limit ?? DEFAULT_SEARCH_REQUEST_LIMIT,
      orderBy: { [orderByField]: sortOrder },
    });

  return {
    selectedEntities: selectedRecords
      .map(mappingFunction)
      .filter(assertNotNull),
    filteredSelectedEntities: filteredSelectedRecords
      .map(mappingFunction)
      .filter(assertNotNull),
    entitiesToSelect: recordsToSelect
      .map(mappingFunction)
      .filter(assertNotNull),
    loading:
      recordsToSelectLoading ||
      filteredSelectedRecordsLoading ||
      selectedRecordsLoading,
  };
};
