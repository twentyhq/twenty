import { BadRequestException } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsWhere, type Repository } from 'typeorm';
import { validate as uuidValidate } from 'uuid';

import { parseEndingBeforeRestRequest } from 'src/engine/api/rest/input-request-parsers/ending-before-parser-utils/parse-ending-before-rest-request.util';
import { parseLimitRestRequest } from 'src/engine/api/rest/input-request-parsers/limit-parser-utils/parse-limit-rest-request.util';
import { parseStartingAfterRestRequest } from 'src/engine/api/rest/input-request-parsers/starting-after-parser-utils/parse-starting-after-rest-request.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import {
  type MetadataCursorPagination,
  paginateMetadataOrderedItems,
  paginateMetadataQueryBuilder,
} from 'src/engine/metadata-modules/pagination/utils/paginate-metadata.util';

export type RestCursorPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
};

export type MetadataRestListResponse<T> = {
  data: T[];
  pageInfo: RestCursorPageInfo;
  totalCount: number;
};

const parseMetadataRestPagination = (
  request: AuthenticatedRequest,
): MetadataCursorPagination => {
  const startingAfter = parseStartingAfterRestRequest(request);
  const endingBefore = parseEndingBeforeRestRequest(request);

  if (isDefined(startingAfter) && isDefined(endingBefore)) {
    throw new BadRequestException(
      `'starting_after' and 'ending_before' cannot be used together.`,
    );
  }

  const invalidCursor = [startingAfter, endingBefore].find(
    (cursor) => isDefined(cursor) && !uuidValidate(cursor),
  );

  if (isDefined(invalidCursor)) {
    throw new BadRequestException(`Invalid cursor: ${invalidCursor}`);
  }

  return {
    limit: parseLimitRestRequest(request),
    direction: isDefined(endingBefore) ? 'backward' : 'forward',
    afterId: startingAfter,
    beforeId: endingBefore,
  };
};

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

export const isMetadataRestRequest = (request: AuthenticatedRequest): boolean =>
  request.originalUrl.startsWith('/rest/metadata/');

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
