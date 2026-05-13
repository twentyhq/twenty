import { type ObjectLiteral } from 'typeorm';

import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';

// Adds a LEFT JOIN for a relation, but only if the same alias isn't already
// joined on the query builder. This lets the filter and order paths each
// request the join they need without coordinating ahead of time — TypeORM
// rejects duplicate aliases otherwise.
export const ensureRelationJoin = (
  queryBuilder: WorkspaceSelectQueryBuilder<ObjectLiteral>,
  parentAlias: string,
  relationName: string,
): void => {
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
