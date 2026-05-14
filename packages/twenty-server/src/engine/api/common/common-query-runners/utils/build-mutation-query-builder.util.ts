import { type ObjectLiteral } from 'typeorm';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';

type BuildMutationQueryBuilderArgs = {
  repository: WorkspaceRepository<ObjectLiteral>;
  alias: string;
  filter: Partial<ObjectRecordFilter>;
  commonQueryParser: GraphqlQueryParser;
};

// Returns a WorkspaceSelectQueryBuilder that the caller can morph into
// .update() / .softDelete() / .delete() / .restore().
//
// Relation-traversal filters add LEFT JOINs to the builder, but TypeORM
// drops join attributes when morphing a SelectQueryBuilder into an
// UPDATE/DELETE/SoftDelete/Restore builder — the generated SQL has no FROM
// entry for the joined alias and Postgres throws. To keep the joins in scope,
// we rewrite the filter as a self-referencing `id IN (SELECT id FROM ... JOIN
// ... WHERE ...)` subquery on the mutation builder. The subquery is a
// self-contained SELECT so its joins survive into the final SQL untouched.
//
// When the filter doesn't traverse any relation, the join attributes list is
// empty and we hand back the directly-filtered builder — same SQL the
// existing code path would have produced.
export const buildMutationQueryBuilder = ({
  repository,
  alias,
  filter,
  commonQueryParser,
}: BuildMutationQueryBuilderArgs): WorkspaceSelectQueryBuilder<ObjectLiteral> => {
  const filteredQueryBuilder = repository.createQueryBuilder(alias);

  commonQueryParser.applyFilterToBuilder(filteredQueryBuilder, alias, filter);

  const hasRelationTraversal =
    filteredQueryBuilder.expressionMap.joinAttributes.length > 0;

  if (!hasRelationTraversal) {
    return filteredQueryBuilder;
  }

  // The subquery is a SELECT — TypeORM auto-injects `deletedAt IS NULL` for
  // SELECT queries on entities with a soft-delete column, but the mutation
  // builders (update / soft-delete / delete / restore) don't. Without
  // `.withDeleted()` here the subquery would silently drop already-deleted
  // rows, breaking `restoreMany` outright and breaking the event-select
  // round-trip on `deleteMany` (the post-mutation "after" select would
  // re-filter the freshly soft-deleted row out of its own response).
  const idSubQueryBuilder = filteredQueryBuilder
    .select(`${alias}.id`)
    .withDeleted();

  return repository
    .createQueryBuilder(alias)
    .where(`"${alias}"."id" IN (${idSubQueryBuilder.getQuery()})`)
    .setParameters(idSubQueryBuilder.expressionMap.parameters);
};
