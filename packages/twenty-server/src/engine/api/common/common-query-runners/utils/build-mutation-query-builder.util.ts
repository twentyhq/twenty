import { type ObjectLiteral } from 'typeorm';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { type GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';

type BuildMutationQueryBuilderArgs = {
  repository: WorkspaceRepository<ObjectLiteral>;
  alias: string;
  filter: Partial<ObjectRecordFilter>;
  commonQueryParser: GraphqlQueryParser;
};

// TypeORM drops join attributes when a SelectQueryBuilder is morphed into
// UPDATE / DELETE / SoftDelete / Restore — the generated SQL would reference
// an alias without a FROM entry and Postgres would throw. When the filter
// adds joins we rewrite it as `id IN (SELECT id FROM ... JOIN ... WHERE ...)`
// so the joins live inside a self-contained subquery.
export const buildMutationQueryBuilder = ({
  repository,
  alias,
  filter,
  commonQueryParser,
}: BuildMutationQueryBuilderArgs): WorkspaceSelectQueryBuilder<ObjectLiteral> => {
  // Defense-in-depth: a defined-but-non-constraining filter (e.g. an empty
  // composite `{ name: {} }` or an empty relation `{ company: {} }`) survives
  // the empty-filter guard yet parses into empty SQL brackets that add no
  // predicate — executing the mutation would touch every row.
  // `filterProducesWhereCondition` runs the full parser, so a malformed filter
  // throws here (surfaced as an invalid-query error) rather than returning false.
  if (!commonQueryParser.filterProducesWhereCondition(alias, filter)) {
    throw new CommonQueryRunnerException(
      'A non-empty filter is required',
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  const filteredQueryBuilder = repository.createQueryBuilder(alias);

  commonQueryParser.applyFilterToBuilder(filteredQueryBuilder, alias, filter);

  const hasRelationTraversal =
    filteredQueryBuilder.expressionMap.joinAttributes.length > 0;

  if (!hasRelationTraversal) {
    return filteredQueryBuilder;
  }

  // TypeORM auto-injects `deletedAt IS NULL` for SELECT-typed queries but
  // not for mutation-typed ones, so the subquery (a SELECT) must opt out to
  // mirror the semantics of the mutation it feeds — otherwise `restoreMany`
  // would never find soft-deleted rows.
  const idSubQueryBuilder = filteredQueryBuilder
    .select(`${alias}.id`)
    .withDeleted();

  return repository
    .createQueryBuilder(alias)
    .where(`"${alias}"."id" IN (${idSubQueryBuilder.getQuery()})`)
    .setParameters(idSubQueryBuilder.expressionMap.parameters);
};
