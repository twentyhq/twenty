import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { RestApiCreateManyHandler } from 'src/engine/api/rest/core/handlers/rest-Api-create-many.handler';
import { RestApiCreateOneHandler } from 'src/engine/api/rest/core/handlers/rest-Api-create-one.handler';
import { RestApiDeleteManyHandler } from 'src/engine/api/rest/core/handlers/rest-Api-delete-many.handler';
import { RestApiDeleteOneHandler } from 'src/engine/api/rest/core/handlers/rest-Api-delete-one.handler';
import { RestApiDestroyManyHandler } from 'src/engine/api/rest/core/handlers/rest-Api-destroy-many.handler';
import { RestApiDestroyOneHandler } from 'src/engine/api/rest/core/handlers/rest-Api-destroy-one.handler';
import { RestApiFindDuplicatesHandler } from 'src/engine/api/rest/core/handlers/rest-Api-find-duplicates.handler';
import { RestApiFindManyHandler } from 'src/engine/api/rest/core/handlers/rest-Api-find-many.handler';
import { RestApiFindOneHandler } from 'src/engine/api/rest/core/handlers/rest-Api-find-one.handler';
import { RestApiGroupByHandler } from 'src/engine/api/rest/core/handlers/rest-Api-group-by.handler';
import { RestApiMergeManyHandler } from 'src/engine/api/rest/core/handlers/rest-Api-merge-many.handler';
import { RestApiRestoreManyHandler } from 'src/engine/api/rest/core/handlers/rest-Api-restore-many.handler';
import { RestApiRestoreOneHandler } from 'src/engine/api/rest/core/handlers/rest-Api-restore-one.handler';
import { RestApiUpdateManyHandler } from 'src/engine/api/rest/core/handlers/rest-Api-update-many.handler';
import { RestApiUpdateOneHandler } from 'src/engine/api/rest/core/handlers/rest-Api-update-one.handler';
import { parseCorePath } from 'src/engine/api/rest/input-request-parsers/path-parser-utils/parse-core-path.utils';
import { parseSoftDeleteRestRequest } from 'src/engine/api/rest/input-request-parsers/soft-delete-parser-utils/parse-soft-delete-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';

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

    const iSsoftDelete = parseSoftDeleteRestRequest(request);

    if (!iSsoftDelete && isDefined(recordId))
      return await this.restApiDestroyOneHandler.handle(request);
    if (!iSsoftDelete && !isDefined(recordId))
      return await this.restApiDestroyManyHandler.handle(request);

    if (iSsoftDelete && isDefined(recordId))
      return await this.restApiDeleteOneHandler.handle(request);
    if (iSsoftDelete && !isDefined(recordId))
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
