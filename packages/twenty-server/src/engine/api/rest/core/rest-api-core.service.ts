import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { CoreQueryBuilderFactory } from 'src/engine/api/rest/core/query-builder/core-query-builder.factory';
import {
  GraphqlApiType,
  RestApiService,
} from 'src/engine/api/rest/rest-api.service';

@Injectable()
export class RestApiCoreService {
  constructor(
    private readonly coreQueryBuilderFactory: CoreQueryBuilderFactory,
    private readonly restApiService: RestApiService,
  ) {}

  async createMany(request: Request) {
    const data = await this.coreQueryBuilderFactory.createMany(request);

    return await this.restApiService.call(GraphqlApiType.CORE, request, data);
  }

  async findDuplicates(request: Request) {
    const data = await this.coreQueryBuilderFactory.findDuplicates(request);

    return await this.restApiService.call(GraphqlApiType.CORE, request, data);
  }
}
