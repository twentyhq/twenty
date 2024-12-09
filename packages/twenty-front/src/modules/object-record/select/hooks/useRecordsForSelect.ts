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
import { useMapRelationViewFilterValueSpecialIdsToRecordIds } from '@/views/view-filter-value/hooks/useResolveRelationViewFilterValue';

export const useRecordsForSelect = ({
  searchFilterText,
  sortOrder = 'AscNullsLast',
  selectedRecordIdsAndSpecialIds,
  limit,
  excludedRecordIds = [],
  objectNameSingular,
}: {
  searchFilterText: string;
  sortOrder?: OrderBy;
  selectedRecordIdsAndSpecialIds: string[];
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

  const { mapRelationViewFilterValueSpecialIdsToRecordIds } =
    useMapRelationViewFilterValueSpecialIdsToRecordIds();

  const selectedRecordIds = mapRelationViewFilterValueSpecialIdsToRecordIds(
    selectedRecordIdsAndSpecialIds,
  );

  const orderByField = getObjectOrderByField(sortOrder);
  const selectedIdsFilter = { id: { in: selectedRecordIds } };

  const { loading: selectedRecordsLoading, records: selectedRecordsData } =
    useFindManyRecords({
      filter: selectedIdsFilter,
      orderBy: orderByField,
      objectNameSingular,
      skip: !selectedRecordIds.length,
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
    skip: !selectedRecordIds.length,
  });

  const notFilterIds = [...selectedRecordIds, ...excludedRecordIds];
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

  const specialSelectableItems: SelectableItem[] =
    objectNameSingular === 'workspaceMember'
      ? [
          {
            id: 'CURRENT_WORKSPACE_MEMBER',
            name: 'Me',
            isSelected: false,
          },
        ]
      : [];

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
    recordsToSelect: [
      ...specialSelectableItems,
      ...(recordsToSelectData
        .map(mapToObjectRecordIdentifier)
        .map((record) => ({
          ...record,
          isSelected: false,
        })) as SelectableItem[]),
    ],
    loading:
      recordsToSelectLoading ||
      filteredSelectedRecordsLoading ||
      selectedRecordsLoading,
  };
};
