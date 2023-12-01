import { QueryHookOptions, QueryResult } from '@apollo/client';
import { isNonEmptyString } from '@sniptt/guards';

import { mapPaginatedRecordsToRecords } from '@/object-record/utils/mapPaginatedRecordsToRecords';
import { EntitiesForMultipleEntitySelect } from '@/ui/input/relation-picker/components/MultipleEntitySelect';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { assertNotNull } from '~/utils/assert';
import { isDefined } from '~/utils/isDefined';

type SearchFilter = { fieldNames: string[]; filter: string | number };

export type OrderBy =
  | 'AscNullsLast'
  | 'DescNullsLast'
  | 'AscNullsFirst'
  | 'DescNullsFirst';

export const DEFAULT_SEARCH_REQUEST_LIMIT = 60;

// TODO: use this for all search queries, because we need selectedEntities and entitiesToSelect each time we want to search
// Filtered entities to select are

// TODO: replace query hooks by useFindManyRecords
export const useFilteredSearchEntityQuery = ({
  queryHook,
  orderByField,
  filters,
  sortOrder = 'AscNullsLast',
  selectedIds,
  mappingFunction,
  limit,
  excludeEntityIds = [],
  objectNamePlural,
}: {
  queryHook: (
    queryOptions?: QueryHookOptions<any, any>,
  ) => QueryResult<any, any>;
  orderByField: string;
  filters: SearchFilter[];
  sortOrder?: OrderBy;
  selectedIds: string[];
  mappingFunction: (entity: any) => EntityForSelect | undefined;
  limit?: number;
  excludeEntityIds?: string[];
  objectNamePlural: string;
}): EntitiesForMultipleEntitySelect<EntityForSelect> => {
  const { loading: selectedEntitiesLoading, data: selectedEntitiesData } =
    queryHook({
      variables: {
        filter: {
          id: {
            in: selectedIds,
          },
        },
        orderBy: {
          [orderByField]: sortOrder,
        },
      } as any,
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
    loading: filteredSelectedEntitiesLoading,
    data: filteredSelectedEntitiesData,
  } = queryHook({
    variables: {
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
    } as any,
  });

  const { loading: entitiesToSelectLoading, data: entitiesToSelectData } =
    queryHook({
      variables: {
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
      } as any,
    });

  return {
    selectedEntities: mapPaginatedRecordsToRecords({
      objectNamePlural: objectNamePlural,
      pagedRecords: selectedEntitiesData,
    })
      .map(mappingFunction)
      .filter(assertNotNull),
    filteredSelectedEntities: mapPaginatedRecordsToRecords({
      objectNamePlural: objectNamePlural,
      pagedRecords: filteredSelectedEntitiesData,
    })
      .map(mappingFunction)
      .filter(assertNotNull),
    entitiesToSelect: mapPaginatedRecordsToRecords({
      objectNamePlural: objectNamePlural,
      pagedRecords: entitiesToSelectData,
    })
      .map(mappingFunction)
      .filter(assertNotNull),
    loading:
      entitiesToSelectLoading ||
      filteredSelectedEntitiesLoading ||
      selectedEntitiesLoading,
  };
};
