import { type ObjectLiteral } from 'typeorm';

import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';

type AddRelationJoinAliasToQueryBuilderArgs = {
  queryBuilder: WorkspaceSelectQueryBuilder<ObjectLiteral>;
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
