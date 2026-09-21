import { type MetadataRestListResponse } from 'src/engine/api/rest/metadata/types/metadata-rest-list-response.type';
import { parseMetadataRestPagination } from 'src/engine/api/rest/metadata/utils/parse-metadata-rest-pagination.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { paginateMetadataOrderedItems } from 'src/engine/metadata-modules/pagination/utils/paginate-metadata-ordered-items.util';

export const paginateMetadataRestItems = <T extends { id: string }>({
  items,
  request,
}: {
  items: T[];
  request: AuthenticatedRequest;
}): MetadataRestListResponse<T> => {
  const page = paginateMetadataOrderedItems({
    items,
    pagination: parseMetadataRestPagination(request),
  });

  return {
    data: page.items,
    pageInfo: page.pageInfo,
    totalCount: items.length,
  };
};
