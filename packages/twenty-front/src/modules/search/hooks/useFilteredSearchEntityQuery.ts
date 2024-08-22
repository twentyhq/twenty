import { isNonEmptyString } from '@sniptt/guards';

import { useMapToObjectRecordIdentifier } from '@/object-metadata/hooks/useMapToObjectRecordIdentifier';
import { DEFAULT_SEARCH_REQUEST_LIMIT } from '@/object-record/constants/DefaultSearchRequestLimit';
import { RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { EntitiesForMultipleEntitySelect } from '@/object-record/relation-picker/types/EntitiesForMultipleEntitySelect';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { makeAndFilterVariables } from '@/object-record/utils/makeAndFilterVariables';
import { makeOrFilterVariables } from '@/object-record/utils/makeOrFilterVariables';
import { OrderBy } from '@/types/OrderBy';
import { generateILikeFiltersForCompositeFields } from '~/utils/array/generateILikeFiltersForCompositeFields';
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
  excludeRecordIds = [],
  objectNameSingular,
}: {
  orderByField: string;
  filters: SearchFilter[];
  sortOrder?: OrderBy;
  selectedIds: string[];
  limit?: number;
  excludeRecordIds?: string[];
  objectNameSingular: string;
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
    useFindManyRecords({
      objectNameSingular,
      filter: selectedIdsFilter,
      orderBy: [{ [orderByField]: sortOrder }],
      skip: !selectedIds.length,
    });

  const searchFilters = filters.map(({ fieldNames, filter }) => {
    if (!isNonEmptyString(filter)) {
      return undefined;
    }

    const formattedFilters = fieldNames.reduce(
      (previousValue: RecordGqlOperationFilter[], fieldName) => {
        const [parentFieldName, subFieldName] = fieldName.split('.');

        if (isNonEmptyString(subFieldName)) {
          // Composite field
          return [
            ...previousValue,
            ...generateILikeFiltersForCompositeFields(filter, parentFieldName, [
              subFieldName,
            ]),
          ];
        }

        return [
          ...previousValue,
          {
            [fieldName]: {
              ilike: `%${filter}%`,
            },
          },
        ];
      },
      [],
    );

    return makeOrFilterVariables(formattedFilters);
  });

  const {
    loading: filteredSelectedRecordsLoading,
    records: filteredSelectedRecords,
  } = useFindManyRecords({
    objectNameSingular,
    filter: makeAndFilterVariables([...searchFilters, selectedIdsFilter]),
    orderBy: [{ [orderByField]: sortOrder }],
    skip: !selectedIds.length,
  });

  const notFilterIds = [...selectedIds, ...excludeRecordIds];
  const notFilter = notFilterIds.length
    ? { not: { id: { in: notFilterIds } } }
    : undefined;
  const { loading: recordsToSelectLoading, records: recordsToSelect } =
    useFindManyRecords({
      objectNameSingular,
      filter: makeAndFilterVariables([...searchFilters, notFilter]),
      limit: limit ?? DEFAULT_SEARCH_REQUEST_LIMIT,
      orderBy: [{ [orderByField]: sortOrder }],
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
