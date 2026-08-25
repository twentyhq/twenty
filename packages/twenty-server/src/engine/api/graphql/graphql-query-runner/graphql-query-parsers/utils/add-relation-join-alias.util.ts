import { type WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';

type AddRelationJoinAliasToQueryBuilderArgs = {
  queryBuilder: WorkspaceSelectQueryBuilderV2;
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
