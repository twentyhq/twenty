import { Injectable } from '@nestjs/common';

import { Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { ApiEventEmitterService } from 'src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { RestApiDeleteOneResolverService } from 'src/engine/api/rest/core/resolvers/rest-api-delete-one-resolver.service';
import { RestApiCreateOneResolverService } from 'src/engine/api/rest/core/resolvers/rest-api-create-one-resolver.service';
import { RestApiUpdateOneResolverService } from 'src/engine/api/rest/core/resolvers/rest-api-update-one-resolver.service';
import { RestApiGetOneResolverService } from 'src/engine/api/rest/core/resolvers/rest-api-get-one-resolver.service';
import { RestApiGetManyResolverService } from 'src/engine/api/rest/core/resolvers/rest-api-get-many-resolver.service';

@Injectable()
export class RestApiCoreServiceV2 {
  constructor(
    protected readonly apiEventEmitterService: ApiEventEmitterService,
    private readonly restApiDeleteOneResolverService: RestApiDeleteOneResolverService,
    private readonly restApiCreateOneResolverService: RestApiCreateOneResolverService,
    private readonly restApiUpdateOneResolverService: RestApiUpdateOneResolverService,
    private readonly restApiGetOneResolverService: RestApiGetOneResolverService,
    private readonly restApiGetManyResolverService: RestApiGetManyResolverService,
  ) {}

  async delete(request: Request) {
    return await this.restApiDeleteOneResolverService.resolve(request);
  }

  async createOne(request: Request) {
    return await this.restApiCreateOneResolverService.resolve(request);
  }

  async update(request: Request) {
    return await this.restApiUpdateOneResolverService.resolve(request);
  }

  async get(request: Request) {
    const { id: recordId } = parseCorePath(request);

    if (isDefined(recordId)) {
      return await this.restApiGetOneResolverService.resolve(request);
    } else {
      return await this.restApiGetManyResolverService.resolve(request);
    }
  }
}
