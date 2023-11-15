import { QueryHookOptions, QueryResult } from '@apollo/client';

import { mapPaginatedObjectsToObjects } from '@/object-record/utils/mapPaginatedObjectsToObjects';
import { EntitiesForMultipleEntitySelect } from '@/ui/input/relation-picker/components/MultipleEntitySelect';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { QueryMode, SortOrder } from '~/generated/graphql';

type SelectStringKeys<T> = NonNullable<
  {
    [K in keyof T]: K extends '__typename'
      ? never
      : T[K] extends string | undefined | null
      ? K
      : never;
  }[keyof T]
>;

type ExtractEntityTypeFromQueryResponse<T> = T extends {
  searchResults: Array<infer U>;
}
  ? U
  : never;

type SearchFilter = { fieldNames: string[]; filter: string | number };

const DEFAULT_SEARCH_REQUEST_LIMIT = 10;

// TODO: use this for all search queries, because we need selectedEntities and entitiesToSelect each time we want to search
// Filtered entities to select are
export const useFilteredSearchEntityQueryV2 = ({
  queryHook,
  orderByField,
  filters,
  sortOrder = SortOrder.Asc,
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
  sortOrder?: SortOrder;
  selectedIds: string[];
  mappingFunction: (entity: any) => EntityForSelect;
  limit?: number;
  excludeEntityIds?: string[];
  objectNamePlural: string;
}): EntitiesForMultipleEntitySelect<EntityForSelect> => {
  const { loading: selectedEntitiesLoading, data: selectedEntitiesData } =
    queryHook({
      variables: {
        where: {
          id: {
            in: selectedIds,
          },
        },
        orderBy: {
          [orderByField]: sortOrder,
        },
      } as any,
    });

  const searchFilter = filters.map(({ fieldNames, filter }) => {
    return {
      OR: fieldNames.map((fieldName) => ({
        [fieldName]: {
          startsWith: `%${filter}%`,
          mode: QueryMode.Insensitive,
        },
      })),
    };
  });

  const {
    loading: filteredSelectedEntitiesLoading,
    data: filteredSelectedEntitiesData,
  } = queryHook({
    variables: {
      where: {
        AND: [
          {
            AND: searchFilter,
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
        where: {
          AND: [
            {
              AND: searchFilter,
            },
            {
              id: {
                notIn: [...selectedIds, ...excludeEntityIds],
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

  console.log({
    selectedEntitiesData,
    test: mapPaginatedObjectsToObjects({
      objectNamePlural: objectNamePlural,
      pagedObjects: selectedEntitiesData,
    }),
  });

  return {
    selectedEntities: mapPaginatedObjectsToObjects({
      objectNamePlural: objectNamePlural,
      pagedObjects: selectedEntitiesData,
    }).map(mappingFunction),
    filteredSelectedEntities: mapPaginatedObjectsToObjects({
      objectNamePlural: objectNamePlural,
      pagedObjects: filteredSelectedEntitiesData,
    }).map(mappingFunction),
    entitiesToSelect: mapPaginatedObjectsToObjects({
      objectNamePlural: objectNamePlural,
      pagedObjects: entitiesToSelectData,
    }).map(mappingFunction),
    loading:
      entitiesToSelectLoading ||
      filteredSelectedEntitiesLoading ||
      selectedEntitiesLoading,
  };
};
