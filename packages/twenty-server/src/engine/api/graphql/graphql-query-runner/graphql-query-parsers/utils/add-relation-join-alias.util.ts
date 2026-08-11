import { type RecordQueryBuilder } from 'src/engine/api/graphql/graphql-query-runner/types/record-query-builder.type';

type AddRelationJoinAliasToQueryBuilderArgs = {
  queryBuilder: RecordQueryBuilder;
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
