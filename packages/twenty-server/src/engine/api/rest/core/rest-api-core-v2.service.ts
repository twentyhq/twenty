import { Injectable } from '@nestjs/common';

import { Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { RestApiDeleteOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-delete-one.handler';
import { RestApiCreateOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-create-one.handler';
import { RestApiUpdateOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-update-one.handler';
import { RestApiGetOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-get-one.handler';
import { RestApiGetManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-get-many.handler';

@Injectable()
export class RestApiCoreServiceV2 {
  constructor(
    private readonly restApiDeleteOneHandler: RestApiDeleteOneHandler,
    private readonly restApiCreateOneHandler: RestApiCreateOneHandler,
    private readonly restApiUpdateOneHandler: RestApiUpdateOneHandler,
    private readonly restApiGetOneHandler: RestApiGetOneHandler,
    private readonly restApiGetManyHandler: RestApiGetManyHandler,
  ) {}

  async delete(request: Request) {
    return await this.restApiDeleteOneHandler.handle(request);
  }

  async createOne(request: Request) {
    return await this.restApiCreateOneHandler.handle(request);
  }

  async update(request: Request) {
    return await this.restApiUpdateOneHandler.handle(request);
  }

  async get(request: Request) {
    const { id: recordId } = parseCorePath(request);

    if (isDefined(recordId)) {
      return await this.restApiGetOneHandler.handle(request);
    } else {
      return await this.restApiGetManyHandler.handle(request);
    }
  }
}
