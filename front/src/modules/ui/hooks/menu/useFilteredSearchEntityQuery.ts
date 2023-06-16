import * as Apollo from '@apollo/client';

import {
  EntitiesForMultipleEntitySelect,
  EntityForSelect,
} from '@/comments/components/MultipleEntitySelect';
import {
  Exact,
  InputMaybe,
  QueryMode,
  Scalars,
  SortOrder,
} from '~/generated/graphql';

type SelectStringKeys<T> = NonNullable<
  {
    [K in keyof T]: T[K] extends string ? K : never;
  }[keyof T]
>;

type ExtractEntityTypeFromQueryResult<T> = T extends {
  searchResults: Array<infer U>;
}
  ? U
  : never;

const DEFAULT_SEARCH_REQUEST_LIMIT = 10;

export function useFilteredSearchEntityQuery<
  EntityType extends ExtractEntityTypeFromQueryResult<QueryResponseForExtract> & {
    id: string;
  },
  EntityStringField extends SelectStringKeys<EntityType>,
  OrderByField extends EntityStringField,
  SearchOnField extends EntityStringField,
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
>({
  queryHook,
  searchOnFields,
  orderByField,
  sortOrder = SortOrder.Asc,
  selectedIds,
  mappingFunction,
  limit,
  searchFilter, // TODO: put in a scoped recoil state
}: {
  queryHook: (
    queryOptions?: Apollo.QueryHookOptions<
      QueryResponseForExtract,
      QueryVariables
    >,
  ) => Apollo.QueryResult<QueryResponse, QueryVariables>;
  searchOnFields: SearchOnField[];
  orderByField: OrderByField;
  sortOrder?: SortOrder;
  selectedIds: string[];
  mappingFunction: (entity: EntityType) => EntityForSelect;
  limit?: number;
  searchFilter: string;
}): EntitiesForMultipleEntitySelect {
  const { data: selectedEntitiesData } = queryHook({
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

  const searchFilterByField = searchOnFields.map((field) => ({
    [field]: {
      contains: `%${searchFilter}%`,
      mode: QueryMode.Insensitive,
    },
  }));

  const { data: filteredSelectedEntitiesData } = queryHook({
    variables: {
      where: {
        AND: [
          {
            OR: searchFilterByField,
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

  const { data: entitiesToSelectData } = queryHook({
    variables: {
      where: {
        AND: [
          {
            OR: searchFilterByField,
          },
          {
            id: {
              notIn: selectedIds,
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
  };
}
