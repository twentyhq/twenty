import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';

type BuildMutationQueryBuilderArgs = {
  repository: WorkspaceRepository;
  alias: string;
  filter: Partial<ObjectRecordFilter>;
  commonQueryParser: GraphqlQueryParser;
};

export const buildMutationQueryBuilder = ({
  repository,
  alias,
  filter,
  commonQueryParser,
}: BuildMutationQueryBuilderArgs): {
  selectQueryBuilder: WorkspaceSelectQueryBuilder;
  rowLevelPermissionsApplied: boolean;
} => {
  const filteredQueryBuilder = repository.createQueryBuilder(alias);

  commonQueryParser.applyFilterToBuilder(filteredQueryBuilder, alias, filter);

  const hasRelationTraversal = filteredQueryBuilder.getJoinAliases().length > 0;

  if (!hasRelationTraversal) {
    return {
      selectQueryBuilder: filteredQueryBuilder,
      rowLevelPermissionsApplied: false,
    };
  }

  const idSubQueryBuilder = filteredQueryBuilder
    .select(`${alias}.id`)
    .withDeleted();

  repository.applyWriteRowLevelPermissions(idSubQueryBuilder);

  const selectQueryBuilder = repository
    .createQueryBuilder(alias)
    .where(`"${alias}"."id" IN (${idSubQueryBuilder.getQuery()})`)
    .setParameters(idSubQueryBuilder.getParameters());

  return { selectQueryBuilder, rowLevelPermissionsApplied: true };
};
