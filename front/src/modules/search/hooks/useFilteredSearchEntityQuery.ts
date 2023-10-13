import { QueryHookOptions, QueryResult } from '@apollo/client';

import { EntitiesForMultipleEntitySelect } from '@/ui/input/relation-picker/components/MultipleEntitySelect';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import {
  Exact,
  InputMaybe,
  QueryMode,
  Scalars,
  SortOrder,
} from '~/generated/graphql';

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
export const useFilteredSearchEntityQuery = <
  EntityType extends ExtractEntityTypeFromQueryResponse<QueryResponseForExtract> & {
    id: string;
  },
  EntityStringField extends SelectStringKeys<EntityType>,
  OrderByField extends EntityStringField,
  QueryResponseForExtract,
  QueryResponse extends {
    searchResults: EntityType[];
  },
  EntityWhereInput,
  EntityOrderByWithRelationInput,
  QueryVariables extends Exact<{
    where?: InputMaybe<EntityWhereInput>;
    limit?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<
      Array<EntityOrderByWithRelationInput> | EntityOrderByWithRelationInput
    >;
  }>,
  CustomEntityForSelect extends EntityForSelect,
>({
  queryHook,
  orderByField,
  filters,
  sortOrder = SortOrder.Asc,
  selectedIds,
  mappingFunction,
  limit,
  excludeEntityIds = [],
}: {
  queryHook: (
    queryOptions?: QueryHookOptions<QueryResponseForExtract, QueryVariables>,
  ) => QueryResult<QueryResponse, QueryVariables>;
  orderByField: OrderByField;
  filters: SearchFilter[];
  sortOrder?: SortOrder;
  selectedIds: string[];
  mappingFunction: (entity: EntityType) => CustomEntityForSelect;
  limit?: number;
  excludeEntityIds?: string[];
}): EntitiesForMultipleEntitySelect<CustomEntityForSelect> => {
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
      } as QueryVariables,
    });

  const searchFilter = filters.map(({ fieldNames, filter }) => {
    return {
      OR: fieldNames.map((fieldName) => ({
        [fieldName]: {
          contains: `%${filter}%`,
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
    } as QueryVariables,
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
      } as QueryVariables,
    });

  return {
    selectedEntities: (selectedEntitiesData?.searchResults ?? []).map(
      mappingFunction,
    ),
    filteredSelectedEntities: (
      filteredSelectedEntitiesData?.searchResults ?? []
    ).map(mappingFunction),
    entitiesToSelect: (entitiesToSelectData?.searchResults ?? []).map(
      mappingFunction,
    ),
    loading:
      entitiesToSelectLoading ||
      filteredSelectedEntitiesLoading ||
      selectedEntitiesLoading,
  };
};
