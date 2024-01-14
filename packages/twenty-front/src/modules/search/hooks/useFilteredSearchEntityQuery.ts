import { isNonEmptyString } from '@sniptt/guards';

import { OrderBy } from '@/object-metadata/types/OrderBy';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { EntitiesForMultipleEntitySelect } from '@/object-record/relation-picker/types/EntitiesForMultipleEntitySelect';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { assertNotNull } from '~/utils/assert';
import { isDefined } from '~/utils/isDefined';

type SearchFilter = { fieldNames: string[]; filter: string | number };

export const DEFAULT_SEARCH_REQUEST_LIMIT = 60;

// TODO: use this for all search queries, because we need selectedEntities and entitiesToSelect each time we want to search
// Filtered entities to select are

export const useFilteredSearchEntityQuery = ({
  orderByField,
  filters,
  sortOrder = 'AscNullsLast',
  selectedIds,
  mappingFunction,
  limit,
  excludeEntityIds = [],
  objectNameSingular,
}: {
  orderByField: string;
  filters: SearchFilter[];
  sortOrder?: OrderBy;
  selectedIds: string[];
  mappingFunction: (entity: any) => EntityForSelect | undefined;
  limit?: number;
  excludeEntityIds?: string[];
  objectNameSingular: string;
}): EntitiesForMultipleEntitySelect<EntityForSelect> => {
  const { loading: selectedRecordsLoading, records: selectedRecords } =
    useFindManyRecords({
      objectNameSingular,
      filter: { id: { in: selectedIds } },
      orderBy: { [orderByField]: sortOrder },
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
    records: filteredSelectedRecords,
  } = useFindManyRecords({
    objectNameSingular,
    filter: { and: [{ and: searchFilter }, { id: { in: selectedIds } }] },
    orderBy: { [orderByField]: sortOrder },
  });

  const { loading: recordsToSelectLoading, records: recordsToSelect } =
    useFindManyRecords({
      objectNameSingular,
      filter: {
        and: [
          { and: searchFilter },
          { not: { id: { in: [...selectedIds, ...excludeEntityIds] } } },
        ],
      },
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
