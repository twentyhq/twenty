import { isNonEmptyString } from '@sniptt/guards';

import { useGetObjectOrderByField } from '@/object-metadata/hooks/useGetObjectOrderByField';
import { useMapToObjectRecordIdentifier } from '@/object-metadata/hooks/useMapToObjectRecordIdentifier';

import { DEFAULT_SEARCH_REQUEST_LIMIT } from '@/object-record/constants/DefaultSearchRequestLimit';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SelectableItem } from '@/object-record/select/types/SelectableItem';
import { getObjectFilterFields } from '@/object-record/select/utils/getObjectFilterFields';
import { makeAndFilterVariables } from '@/object-record/utils/makeAndFilterVariables';
import { makeOrFilterVariables } from '@/object-record/utils/makeOrFilterVariables';
import { OrderBy } from '@/types/OrderBy';

export const useRecordsForSelect = ({
  searchFilterText,
  sortOrder = 'AscNullsLast',
  selectedIds,
  limit,
  excludedRecordIds = [],
  objectNameSingular,
}: {
  searchFilterText: string;
  sortOrder?: OrderBy;
  selectedIds: string[];
  limit?: number;
  excludedRecordIds?: string[];
  objectNameSingular: string;
}) => {
  const { mapToObjectRecordIdentifier } = useMapToObjectRecordIdentifier({
    objectNameSingular,
  });

  const filters = [
    {
      fieldNames: getObjectFilterFields(objectNameSingular) ?? [],
      filter: searchFilterText,
    },
  ];

  const { getObjectOrderByField } = useGetObjectOrderByField({
    objectNameSingular,
  });

  const orderByField = getObjectOrderByField(sortOrder);
  const selectedIdsFilter = { id: { in: selectedIds } };

  const { loading: selectedRecordsLoading, records: selectedRecordsData } =
    useFindManyRecords({
      filter: selectedIdsFilter,
      orderBy: orderByField,
      objectNameSingular,
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
    records: filteredSelectedRecordsData,
  } = useFindManyRecords({
    filter: makeAndFilterVariables([...searchFilters, selectedIdsFilter]),
    orderBy: orderByField,
    objectNameSingular,
    skip: !selectedIds.length,
  });

  const notFilterIds = [...selectedIds, ...excludedRecordIds];
  const notFilter = notFilterIds.length
    ? { not: { id: { in: notFilterIds } } }
    : undefined;
  const { loading: recordsToSelectLoading, records: recordsToSelectData } =
    useFindManyRecords({
      filter: makeAndFilterVariables([...searchFilters, notFilter]),
      limit: limit ?? DEFAULT_SEARCH_REQUEST_LIMIT,
      orderBy: orderByField,
      objectNameSingular,
    });

  return {
    selectedRecords: selectedRecordsData
      .map(mapToObjectRecordIdentifier)
      .map((record) => ({
        ...record,
        isSelected: true,
      })) as SelectableItem[],
    filteredSelectedRecords: filteredSelectedRecordsData
      .map(mapToObjectRecordIdentifier)
      .map((record) => ({
        ...record,
        isSelected: true,
      })) as SelectableItem[],
    recordsToSelect: recordsToSelectData
      .map(mapToObjectRecordIdentifier)
      .map((record) => ({
        ...record,
        isSelected: false,
      })) as SelectableItem[],
    loading:
      recordsToSelectLoading ||
      filteredSelectedRecordsLoading ||
      selectedRecordsLoading,
  };
};
