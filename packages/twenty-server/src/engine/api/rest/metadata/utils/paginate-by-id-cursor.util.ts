import { type FindOptionsWhere } from 'typeorm';

import { isDefined } from 'twenty-shared/utils';

import { type RestCursorPageInfo } from 'src/engine/api/rest/metadata/types/rest-cursor-page-info.type';
import { parseMetadataRestPagination } from 'src/engine/api/rest/metadata/utils/parse-metadata-rest-pagination.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request.type';
import { paginateMetadataQueryBuilder } from 'src/engine/metadata-modules/pagination/utils/paginate-metadata-query-builder.util';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export const paginateByIdCursor = async <
  T extends { id: string; workspaceId: string },
>({
  repository,
  workspaceId,
  where,
  request,
}: {
  repository: WorkspaceScopedRepository<T>;
  workspaceId: string;
  where?: FindOptionsWhere<T>;
  request: AuthenticatedRequest;
}): Promise<{
  items: T[];
  pageInfo: RestCursorPageInfo;
  totalCount: number;
}> => {
  const queryBuilder = repository.createScopedQueryBuilder(
    workspaceId,
    'metadata',
  );

  if (isDefined(where)) {
    queryBuilder.andWhere(where);
  }

  const countQueryBuilder = queryBuilder.clone();
  const [page, totalCount] = await Promise.all([
    paginateMetadataQueryBuilder({
      queryBuilder,
      alias: 'metadata',
      pagination: parseMetadataRestPagination(request),
    }),
    countQueryBuilder.getCount(),
  ]);

  return {
    items: page.items,
    pageInfo: page.pageInfo,
    totalCount,
  };
};
