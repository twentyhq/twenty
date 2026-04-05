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
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { getServerUrl } from 'src/utils/get-server-url';

@Injectable()
export class RestApiMetadataService {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly metadataQueryBuilderFactory: MetadataQueryBuilderFactory,
    private readonly restApiService: RestApiService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
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

    const result = await this.restApiService.call(
      GraphqlApiType.METADATA,
      requestContext,
      data,
    );

    // Invalidate GraphQL schema cache after metadata changes
    await this.invalidateGraphQLSchemaCache(requestContext);

    return result;
  }

  async update(request: Request) {
    await this.accessTokenService.validateTokenByRequest(request);
    const requestContext = this.getRequestContext(request);
    const data = await this.metadataQueryBuilderFactory.update(requestContext, {
      fields: ['*'],
    });

    const result = await this.restApiService.call(
      GraphqlApiType.METADATA,
      requestContext,
      data,
    );

    // Invalidate GraphQL schema cache after metadata changes
    await this.invalidateGraphQLSchemaCache(requestContext);

    return result;
  }

  async delete(request: Request) {
    await this.accessTokenService.validateTokenByRequest(request);
    const requestContext = this.getRequestContext(request);
    const data = await this.metadataQueryBuilderFactory.delete(requestContext);

    const result = await this.restApiService.call(
      GraphqlApiType.METADATA,
      requestContext,
      data,
    );

    // Invalidate GraphQL schema cache after metadata changes
    await this.invalidateGraphQLSchemaCache(requestContext);

    return result;
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

  private async invalidateGraphQLSchemaCache(requestContext: RequestContext): Promise<void> {
    // Extract workspace ID from the authenticated request context
    // The request should have workspace information from the guards
    const authenticatedRequest = requestContext as any;
    
    if (authenticatedRequest.workspace?.id) {
      // Invalidate GraphQL schema cache for the workspace
      await this.workspaceCacheStorageService.flushVersionedMetadata(authenticatedRequest.workspace.id);
    }
  }
}
