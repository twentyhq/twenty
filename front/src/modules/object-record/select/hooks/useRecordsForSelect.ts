import { isNonEmptyString } from '@sniptt/guards';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SelectableRecord } from '@/object-record/select/types/SelectableRecord';
import { getObjectFilterFields } from '@/object-record/select/utils/getObjectFilterFields';
import { getObjectOrderByField } from '@/object-record/select/utils/getObjectOrderByField';
import { isDefined } from '~/utils/isDefined';

export type OrderBy =
  | 'AscNullsLast'
  | 'DescNullsLast'
  | 'AscNullsFirst'
  | 'DescNullsFirst';

export const DEFAULT_SEARCH_REQUEST_LIMIT = 60;

export const useRecordsForSelect = ({
  searchFilterText,
  sortOrder = 'AscNullsLast',
  selectedIds,
  limit,
  excludeEntityIds = [],
  objectNameSingular,
}: {
  searchFilterText: string;
  sortOrder?: OrderBy;
  selectedIds: string[];
  limit?: number;
  excludeEntityIds?: string[];
  objectNameSingular: string;
}) => {
  const { mapToObjectRecordIdentifier } = useObjectMetadataItem({
    objectNameSingular,
  });

  const filters = [
    {
      fieldNames: getObjectFilterFields(objectNameSingular) ?? [],
      filter: searchFilterText,
    },
  ];

  const orderByField = getObjectOrderByField(objectNameSingular);

  const { loading: selectedRecordsLoading, records: selectedRecordsData } =
    useFindManyRecords({
      filter: {
        id: {
          in: selectedIds,
        },
      },
      orderBy: {
        [orderByField]: sortOrder,
      },
      objectNameSingular,
    });

  const searchFilter = filters
    .map(({ fieldNames, filter }) => {
      if (!isNonEmptyString(filter)) {
        return undefined;
      }

      return {
        or: fieldNames.map((fieldName) => {
          const fieldNameParts = fieldName.split('.');

          if (fieldNameParts.length > 1) {
            // Composite field

            return {
              [fieldNameParts[0]]: {
                [fieldNameParts[1]]: {
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
      };
    })
    .filter(isDefined);

  const {
    loading: filteredSelectedRecordsLoading,
    records: filteredSelectedRecordsData,
  } = useFindManyRecords({
    filter: {
      and: [
        {
          and: searchFilter,
        },
        {
          id: {
            in: selectedIds,
          },
        },
      ],
    },
    orderBy: {
      [orderByField]: sortOrder,
    },
    objectNameSingular,
  });

  const { loading: recordsToSelectLoading, records: recordsToSelectData } =
    useFindManyRecords({
      filter: {
        and: [
          {
            and: searchFilter,
          },
          {
            not: {
              id: {
                in: [...selectedIds, ...excludeEntityIds],
              },
            },
          },
        ],
      },
      limit: limit ?? DEFAULT_SEARCH_REQUEST_LIMIT,
      orderBy: {
        [orderByField]: sortOrder,
      },
      objectNameSingular,
    });

  return {
    selectedRecords: selectedRecordsData
      .map(mapToObjectRecordIdentifier)
      .map((record) => ({
        ...record,
        isSelected: true,
      })) as SelectableRecord[],
    filteredSelectedRecords: filteredSelectedRecordsData
      .map(mapToObjectRecordIdentifier)
      .map((record) => ({
        ...record,
        isSelected: true,
      })) as SelectableRecord[],
    recordsToSelect: recordsToSelectData
      .map(mapToObjectRecordIdentifier)
      .map((record) => ({
        ...record,
        isSelected: false,
      })) as SelectableRecord[],
    loading:
      recordsToSelectLoading ||
      filteredSelectedRecordsLoading ||
      selectedRecordsLoading,
  };
};
