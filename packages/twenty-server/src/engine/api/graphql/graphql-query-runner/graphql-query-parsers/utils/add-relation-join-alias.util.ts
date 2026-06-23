import { type FilterWhereQueryBuilder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/filter-where-condition-recorder';

type AddRelationJoinAliasToQueryBuilderArgs = {
  queryBuilder: FilterWhereQueryBuilder;
  parentAlias: string;
  relationName: string;
};

export const addRelationJoinAliasToQueryBuilder = ({
  queryBuilder,
  parentAlias,
  relationName,
}: AddRelationJoinAliasToQueryBuilderArgs): void => {
  const alreadyJoined = queryBuilder.expressionMap.joinAttributes.some(
    (joinAttribute) => joinAttribute.alias.name === relationName,
  );

  if (alreadyJoined) {
    return;
  }

  queryBuilder.leftJoin(`${parentAlias}.${relationName}`, relationName);
};
