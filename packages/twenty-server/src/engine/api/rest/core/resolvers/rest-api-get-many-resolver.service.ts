import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { RestApiBaseResolverService } from 'src/engine/api/rest/core/interfaces/rest-api-base-resolver.service';

@Injectable()
export class RestApiGetManyResolverService extends RestApiBaseResolverService {
  async resolve(request: Request) {
    const {
      objectMetadataNameSingular,
      objectMetadataNamePlural,
      repository,
      dataSource,
      objectMetadata,
      objectMetadataItemWithFieldsMaps,
    } = await this.getRepositoryAndMetadataOrFail(request);

    const { records, isForwardPagination, hasMoreRecords, totalCount } =
      await this.findRecords({
        request,
        repository,
        dataSource,
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
