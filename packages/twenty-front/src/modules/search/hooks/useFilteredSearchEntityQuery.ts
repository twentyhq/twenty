import { isNonEmptyString } from '@sniptt/guards';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { OrderBy } from '@/object-metadata/types/OrderBy';
import { DEFAULT_SEARCH_REQUEST_LIMIT } from '@/object-record/constants/DefaultSearchRequestLimit';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { EntitiesForMultipleEntitySelect } from '@/object-record/relation-picker/types/EntitiesForMultipleEntitySelect';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { makeAndFilterVariables } from '@/object-record/utils/makeAndFilterVariables';
import { makeOrFilterVariables } from '@/object-record/utils/makeOrFilterVariables';
import { isDefined } from '~/utils/isDefined';

type SearchFilter = { fieldNames: string[]; filter: string | number };

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

    return makeOrFilterVariables(
      fieldNames.map((fieldName) => {
        const [parentFieldName, subFieldName] = fieldName.split('.');

        if (isNonEmptyString(subFieldName)) {
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
    filter: makeAndFilterVariables([...searchFilters, selectedIdsFilter]),
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
      filter: makeAndFilterVariables([...searchFilters, notFilter]),
      limit: limit ?? DEFAULT_SEARCH_REQUEST_LIMIT,
      orderBy: { [orderByField]: sortOrder },
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
