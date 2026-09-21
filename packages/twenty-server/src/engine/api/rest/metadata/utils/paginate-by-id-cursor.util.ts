import { type FindOptionsWhere, type Repository } from 'typeorm';

import { type RestCursorPageInfo } from 'src/engine/api/rest/metadata/types/rest-cursor-page-info.type';
import { parseMetadataRestPagination } from 'src/engine/api/rest/metadata/utils/parse-metadata-rest-pagination.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { paginateMetadataQueryBuilder } from 'src/engine/metadata-modules/pagination/utils/paginate-metadata-query-builder.util';

export const paginateByIdCursor = async <
  T extends { id: string; workspaceId: string },
>({
  repository,
  workspaceId,
  where,
  request,
}: {
  repository: Repository<T>;
  workspaceId: string;
  where?: FindOptionsWhere<T>;
  request: AuthenticatedRequest;
}): Promise<{
  items: T[];
  pageInfo: RestCursorPageInfo;
  totalCount: number;
}> => {
  const baseWhere = { ...where, workspaceId } as FindOptionsWhere<T>;
  const queryBuilder = repository
    .createQueryBuilder('metadata')
    .where(baseWhere);
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
