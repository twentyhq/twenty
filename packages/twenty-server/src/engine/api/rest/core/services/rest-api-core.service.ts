import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type RestApiCreateManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-create-many.handler';
import { type RestApiCreateOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-create-one.handler';
import { type RestApiDeleteManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-delete-many.handler';
import { type RestApiDeleteOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-delete-one.handler';
import { type RestApiDestroyManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-destroy-many.handler';
import { type RestApiDestroyOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-destroy-one.handler';
import { type RestApiFindDuplicatesHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-duplicates.handler';
import { type RestApiFindManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-many.handler';
import { type RestApiFindOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-one.handler';
import { type RestApiGroupByHandler } from 'src/engine/api/rest/core/handlers/rest-api-group-by.handler';
import { type RestApiMergeManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-merge-many.handler';
import { type RestApiRestoreManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-restore-many.handler';
import { type RestApiRestoreOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-restore-one.handler';
import { type RestApiUpdateManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-update-many.handler';
import { type RestApiUpdateOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-update-one.handler';
import { parseCorePath } from 'src/engine/api/rest/input-request-parsers/path-parser-utils/parse-core-path.utils';
import { parseSoftDeleteRestRequest } from 'src/engine/api/rest/input-request-parsers/soft-delete-parser-utils/parse-soft-delete-rest-request.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';

@Injectable()
export class RestApiCoreService {
  constructor(
    private readonly restApiCreateOneHandler: RestApiCreateOneHandler,
    private readonly restApiCreateManyHandler: RestApiCreateManyHandler,
    private readonly restApiUpdateOneHandler: RestApiUpdateOneHandler,
    private readonly restApiUpdateManyHandler: RestApiUpdateManyHandler,
    private readonly restApiFindOneHandler: RestApiFindOneHandler,
    private readonly restApiFindManyHandler: RestApiFindManyHandler,
    private readonly restApiFindDuplicatesHandler: RestApiFindDuplicatesHandler,
    private readonly restApiGroupByHandler: RestApiGroupByHandler,
    private readonly restApiDestroyOneHandler: RestApiDestroyOneHandler,
    private readonly restApiDestroyManyHandler: RestApiDestroyManyHandler,
    private readonly restApiDeleteOneHandler: RestApiDeleteOneHandler,
    private readonly restApiDeleteManyHandler: RestApiDeleteManyHandler,
    private readonly restApiRestoreOneHandler: RestApiRestoreOneHandler,
    private readonly restApiRestoreManyHandler: RestApiRestoreManyHandler,
    private readonly restApiMergeManyHandler: RestApiMergeManyHandler,
  ) {}

  async createOne(request: AuthenticatedRequest) {
    return await this.restApiCreateOneHandler.handle(request);
  }

  async createMany(request: AuthenticatedRequest) {
    return await this.restApiCreateManyHandler.handle(request);
  }

  async findDuplicates(request: AuthenticatedRequest) {
    return await this.restApiFindDuplicatesHandler.handle(request);
  }

  async update(request: AuthenticatedRequest) {
    const { id: recordId } = parseCorePath(request);

    if (isDefined(recordId)) {
      return await this.restApiUpdateOneHandler.handle(request);
    } else {
      return await this.restApiUpdateManyHandler.handle(request);
    }
  }

  async get(request: AuthenticatedRequest) {
    const { id: recordId } = parseCorePath(request);

    if (isDefined(recordId)) {
      return await this.restApiFindOneHandler.handle(request);
    } else {
      return await this.restApiFindManyHandler.handle(request);
    }
  }

  async groupBy(request: AuthenticatedRequest) {
    return await this.restApiGroupByHandler.handle(request);
  }

  async delete(request: AuthenticatedRequest) {
    const { id: recordId } = parseCorePath(request);

    const isSoftDelete = parseSoftDeleteRestRequest(request);

    if (!isSoftDelete && isDefined(recordId))
      return await this.restApiDestroyOneHandler.handle(request);
    if (!isSoftDelete && !isDefined(recordId))
      return await this.restApiDestroyManyHandler.handle(request);

    if (isSoftDelete && isDefined(recordId))
      return await this.restApiDeleteOneHandler.handle(request);
    if (isSoftDelete && !isDefined(recordId))
      return await this.restApiDeleteManyHandler.handle(request);
  }

  async restore(request: AuthenticatedRequest) {
    const { id: recordId } = parseCorePath(request);

    if (isDefined(recordId)) {
      return await this.restApiRestoreOneHandler.handle(request);
    } else {
      return await this.restApiRestoreManyHandler.handle(request);
    }
  }

  async mergeMany(request: AuthenticatedRequest) {
    return await this.restApiMergeManyHandler.handle(request);
  }
}
