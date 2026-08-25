import { type WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm-v2/query-builder/workspace-select-query-builder-v2';

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
