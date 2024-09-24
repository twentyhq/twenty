import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { MetadataQueryBuilderFactory } from 'src/engine/api/rest/metadata/query-builder/metadata-query-builder.factory';
import {
  GraphqlApiType,
  RestApiService,
} from 'src/engine/api/rest/rest-api.service';
import { TokenService } from 'src/engine/core-modules/auth/token/services/token.service';

@Injectable()
export class RestApiMetadataService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly metadataQueryBuilderFactory: MetadataQueryBuilderFactory,
    private readonly restApiService: RestApiService,
  ) {}

  async get(request: Request) {
    await this.tokenService.validateToken(request);
    const data = await this.metadataQueryBuilderFactory.get(request);

    return await this.restApiService.call(
      GraphqlApiType.METADATA,
      request,
      data,
    );
  }

  async create(request: Request) {
    await this.tokenService.validateToken(request);
    const data = await this.metadataQueryBuilderFactory.create(request);

    return await this.restApiService.call(
      GraphqlApiType.METADATA,
      request,
      data,
    );
  }

  async update(request: Request) {
    await this.tokenService.validateToken(request);
    const data = await this.metadataQueryBuilderFactory.update(request);

    return await this.restApiService.call(
      GraphqlApiType.METADATA,
      request,
      data,
    );
  }

  async delete(request: Request) {
    await this.tokenService.validateToken(request);
    const data = await this.metadataQueryBuilderFactory.delete(request);

    return await this.restApiService.call(
      GraphqlApiType.METADATA,
      request,
      data,
    );
  }
}
