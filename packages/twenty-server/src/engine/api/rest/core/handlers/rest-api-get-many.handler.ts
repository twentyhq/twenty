import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

@Injectable()
export class RestApiGetManyHandler extends RestApiBaseHandler {
  async handle(request: Request) {
    const {
      objectMetadataNameSingular,
      objectMetadataNamePlural,
      repository,
      objectMetadata,
      objectMetadataItemWithFieldsMaps,
    } = await this.getRepositoryAndMetadataOrFail(request);

    const { records, isForwardPagination, hasMoreRecords, totalCount } =
      await this.findRecords({
        request,
        repository,
        objectMetadata,
        objectMetadataNameSingular,
        objectMetadataItemWithFieldsMaps,
      });

    return this.formatPaginatedResult(
      records,
      objectMetadataNamePlural,
      isForwardPagination,
      hasMoreRecords,
      totalCount,
    );
  }
}
