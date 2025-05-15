import { Injectable } from '@nestjs/common';

import { Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { RestApiDeleteOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-delete-one.handler';
import { RestApiCreateOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-create-one.handler';
import { RestApiUpdateOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-update-one.handler';
import { RestApiFindOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-one.handler';
import { RestApiFindManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-many.handler';
import { RestApiCreateManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-create-many.handler';
import { RestApiFindDuplicatesHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-duplicates.handler';

@Injectable()
export class RestApiCoreService {
  constructor(
    private readonly restApiDeleteOneHandler: RestApiDeleteOneHandler,
    private readonly restApiCreateOneHandler: RestApiCreateOneHandler,
    private readonly restApiCreateManyHandler: RestApiCreateManyHandler,
    private readonly restApiUpdateOneHandler: RestApiUpdateOneHandler,
    private readonly restApiFindOneHandler: RestApiFindOneHandler,
    private readonly restApiFindManyHandler: RestApiFindManyHandler,
    private readonly restApiFindDuplicatesHandler: RestApiFindDuplicatesHandler,
  ) {}

  async delete(request: Request) {
    return await this.restApiDeleteOneHandler.handle(request);
  }

  async createOne(request: Request) {
    return await this.restApiCreateOneHandler.handle(request);
  }

  async createMany(request: Request) {
    return await this.restApiCreateManyHandler.handle(request);
  }

  async findDuplicates(request: Request) {
    return await this.restApiFindDuplicatesHandler.handle(request);
  }

  async update(request: Request) {
    return await this.restApiUpdateOneHandler.handle(request);
  }

  async get(request: Request) {
    const { id: recordId } = parseCorePath(request);

    if (isDefined(recordId)) {
      return await this.restApiFindOneHandler.handle(request);
    } else {
      return await this.restApiFindManyHandler.handle(request);
    }
  }
}
