import { Injectable } from '@nestjs/common';

import { type Request } from 'express';

import { MetadataQueryBuilderFactory } from 'src/engine/api/rest/metadata/query-builder/metadata-query-builder.factory';
import {
  GraphqlApiType,
  RestApiService,
} from 'src/engine/api/rest/rest-api.service';
import { type RequestContext } from 'src/engine/api/rest/types/RequestContext';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { getServerUrl } from 'src/utils/get-server-url';

@Injectable()
export class RestApiMetadataService {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly metadataQueryBuilderFactory: MetadataQueryBuilderFactory,
    private readonly restApiService: RestApiService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async get(request: Request) {
    await this.accessTokenService.validateTokenByRequest(request);
    const requestContext = this.getRequestContext(request);
    const data = await this.metadataQueryBuilderFactory.get(requestContext, {
      fields: ['*'],
    });

    return await this.restApiService.call(
      GraphqlApiType.METADATA,
      requestContext,
      data,
    );
  }

  async create(request: Request) {
    await this.accessTokenService.validateTokenByRequest(request);
    const requestContext = this.getRequestContext(request);
    const data = await this.metadataQueryBuilderFactory.create(requestContext, {
      fields: ['*'],
    });

    return await this.restApiService.call(
      GraphqlApiType.METADATA,
      requestContext,
      data,
    );
  }

  async update(request: Request) {
    await this.accessTokenService.validateTokenByRequest(request);
    const requestContext = this.getRequestContext(request);
    const data = await this.metadataQueryBuilderFactory.update(requestContext, {
      fields: ['*'],
    });

    return await this.restApiService.call(
      GraphqlApiType.METADATA,
      requestContext,
      data,
    );
  }

  async delete(request: Request) {
    await this.accessTokenService.validateTokenByRequest(request);
    const requestContext = this.getRequestContext(request);
    const data = await this.metadataQueryBuilderFactory.delete(requestContext);

    return await this.restApiService.call(
      GraphqlApiType.METADATA,
      requestContext,
      data,
    );
  }

  private getRequestContext(request: Request): RequestContext {
    const baseUrl = getServerUrl({
      serverUrlEnv: this.twentyConfigService.get('SERVER_URL'),
      serverUrlFallback: `${request.protocol}://${request.get('host')}`,
    });

    return {
      body: request.body,
      baseUrl: baseUrl,
      path: request.url,
      headers: request.headers,
    };
  }
}
