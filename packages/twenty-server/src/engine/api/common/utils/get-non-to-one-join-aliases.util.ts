import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';

// Aliases whose join can duplicate root rows: to-many joins break row-level LIMIT
export const getNonToOneJoinAliases = (
  queryBuilder: WorkspaceSelectQueryBuilder,
): string[] =>
  queryBuilder
    .getJoinAliases()
    .filter(({ isToMany }) => isToMany)
    .map(({ name }) => name);
