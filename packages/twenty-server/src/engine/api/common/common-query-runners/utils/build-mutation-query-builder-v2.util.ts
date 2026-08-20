import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { type WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm-v2/query-builder/workspace-select-query-builder-v2';
import { type WorkspaceRepositoryV2 } from 'src/engine/twenty-orm-v2/repository/workspace-repository-v2';

type BuildMutationQueryBuilderV2Args = {
  repository: WorkspaceRepositoryV2;
  alias: string;
  filter: Partial<ObjectRecordFilter>;
  commonQueryParser: GraphqlQueryParser;
};

export const buildMutationQueryBuilderV2 = ({
  repository,
  alias,
  filter,
  commonQueryParser,
}: BuildMutationQueryBuilderV2Args): {
  selectQueryBuilder: WorkspaceSelectQueryBuilderV2;
  rowLevelPermissionsApplied: boolean;
} => {
  const filteredQueryBuilder = repository.createQueryBuilder(alias);

  commonQueryParser.applyFilterToBuilder(filteredQueryBuilder, alias, filter);

  const hasRelationTraversal =
    filteredQueryBuilder.expressionMap.joinAttributes.length > 0;

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
