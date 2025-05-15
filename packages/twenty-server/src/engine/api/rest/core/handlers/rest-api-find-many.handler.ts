import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

@Injectable()
export class RestApiFindManyHandler extends RestApiBaseHandler {
  async handle(request: Request) {
    const {
      objectMetadataNameSingular,
      objectMetadataNamePlural,
      repository,
      objectMetadata,
      objectMetadataItemWithFieldsMaps,
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
      objectMetadataNameSingular,
      objectMetadataItemWithFieldsMaps,
    });

    return this.formatPaginatedResult({
      finalRecords: records,
      objectMetadataNamePlural,
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
