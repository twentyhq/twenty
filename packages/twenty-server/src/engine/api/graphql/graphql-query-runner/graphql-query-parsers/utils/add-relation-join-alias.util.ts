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
  const existingJoinAliases = new Set(
    queryBuilder.expressionMap.joinAttributes.map(
      (joinAttribute) => joinAttribute.alias.name,
    ),
  );

  if (existingJoinAliases.has(relationName)) {
    return;
  }

  queryBuilder.leftJoin(`${parentAlias}.${relationName}`, relationName);
};
