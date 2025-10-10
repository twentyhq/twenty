import { Injectable } from '@nestjs/common';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';

@Injectable()
export class RestApiFindManyHandler extends RestApiBaseHandler {
  async handle(request: AuthenticatedRequest) {
    const {
      repository,
      objectMetadata,
      objectMetadataItemWithFieldsMaps,
      restrictedFields,
    } = await this.getRepositoryAndMetadataOrFail(request);

    const {
      records,
      isForwardPagination,
      hasMoreRecords,
      totalCount,
      startCursor,
      endCursor,
    } = await this.findRecords({
      request,
      repository,
      objectMetadata,
      objectMetadataItemWithFieldsMaps,
      restrictedFields,
    });

    return this.formatPaginatedResult({
      finalRecords: records,
      objectMetadataNamePlural: objectMetadata.objectMetadataMapItem.namePlural,
      isForwardPagination,
      hasMoreRecords,
      totalCount,
      startCursor,
      endCursor,
    });
  }

  formatPaginatedResult({
    finalRecords,
    objectMetadataNamePlural,
    isForwardPagination,
    hasMoreRecords,
    totalCount,
    startCursor,
    endCursor,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    finalRecords: any[];
    objectMetadataNamePlural: string;
    isForwardPagination: boolean;
    hasMoreRecords: boolean;
    totalCount: number;
    startCursor: string | null;
    endCursor: string | null;
  }) {
    const hasPreviousPage = !isForwardPagination && hasMoreRecords;

    return this.formatResult({
      operation: 'findMany',
      objectNamePlural: objectMetadataNamePlural,
      data: isForwardPagination ? finalRecords : finalRecords.reverse(),
      pageInfo: {
        hasNextPage: isForwardPagination && hasMoreRecords,
        ...(hasPreviousPage ? { hasPreviousPage } : {}),
        startCursor,
        endCursor,
      },
      totalCount,
    });
  }
}
