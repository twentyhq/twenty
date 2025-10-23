import { BadRequestException, Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { RestApiCreateManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-create-many.handler';
import { RestApiCreateOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-create-one.handler';
import { RestApiDeleteManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-delete-many.handler';
import { RestApiDeleteOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-delete-one.handler';
import { RestApiDestroyManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-destroy-many.handler';
import { RestApiDestroyOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-destroy-one.handler';
import { RestApiFindDuplicatesHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-duplicates.handler';
import { RestApiFindManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-many.handler';
import { RestApiFindOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-one.handler';
import { RestApiGroupByHandler } from 'src/engine/api/rest/core/handlers/rest-api-group-by.handler';
import { RestApiUpdateOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-update-one.handler';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { parseSoftDeleteRestRequest } from 'src/engine/api/rest/input-request-parsers/soft-delete-parser-utils/parse-soft-delete-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';

@Injectable()
export class RestApiCoreService {
  constructor(
    private readonly restApiCreateOneHandler: RestApiCreateOneHandler,
    private readonly restApiCreateManyHandler: RestApiCreateManyHandler,
    private readonly restApiFindOneHandler: RestApiFindOneHandler,
    private readonly restApiFindManyHandler: RestApiFindManyHandler,
    private readonly restApiFindDuplicatesHandler: RestApiFindDuplicatesHandler,
    private readonly restApiGroupByHandler: RestApiGroupByHandler,
    private readonly restApiUpdateOneHandler: RestApiUpdateOneHandler,
    private readonly restApiDestroyOneHandler: RestApiDestroyOneHandler,
    private readonly restApiDestroyManyHandler: RestApiDestroyManyHandler,
    private readonly restApiDeleteOneHandler: RestApiDeleteOneHandler,
    private readonly restApiDeleteManyHandler: RestApiDeleteManyHandler,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  private async isCommonApiEnabled(request: AuthenticatedRequest) {
    return await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_COMMON_API_ENABLED,
      request.workspace.id,
    );
  }

  async createOne(request: AuthenticatedRequest) {
    const isCommonApiEnabled = await this.isCommonApiEnabled(request);

    if (isCommonApiEnabled) {
      return await this.restApiCreateOneHandler.commonHandle(request);
    } else {
      return await this.restApiCreateOneHandler.handle(request);
    }
  }

  async createMany(request: AuthenticatedRequest) {
    const isCommonApiEnabled = await this.isCommonApiEnabled(request);

    if (isCommonApiEnabled) {
      return await this.restApiCreateManyHandler.commonHandle(request);
    } else {
      return await this.restApiCreateManyHandler.handle(request);
    }
  }

  async get(request: AuthenticatedRequest) {
    const { id: recordId } = parseCorePath(request);
    const isCommonApiEnabled = await this.isCommonApiEnabled(request);

    if (isCommonApiEnabled) {
      if (isDefined(recordId)) {
        return await this.restApiFindOneHandler.commonHandle(request);
      } else {
        return await this.restApiFindManyHandler.commonHandle(request);
      }
    } else {
      if (isDefined(recordId)) {
        return await this.restApiFindOneHandler.handle(request);
      } else {
        return await this.restApiFindManyHandler.handle(request);
      }
    }
  }

  async groupBy(request: AuthenticatedRequest) {
    const isCommonApiEnabled = await this.isCommonApiEnabled(request);

    if (isCommonApiEnabled) {
      return await this.restApiGroupByHandler.handle(request);
    } else {
      throw new BadRequestException(
        'Activate feature flag to use GroupBy in the REST API',
      );
    }
  }

  async findDuplicates(request: AuthenticatedRequest) {
    return await this.restApiFindDuplicatesHandler.handle(request);
  }

  async update(request: AuthenticatedRequest) {
    return await this.restApiUpdateOneHandler.handle(request);
  }

  async delete(request: AuthenticatedRequest) {
    const { id: recordId } = parseCorePath(request);

    const isCommonApiEnabled = await this.isCommonApiEnabled(request);
    const isSoftDelete = parseSoftDeleteRestRequest(request);

    if (isCommonApiEnabled && !isSoftDelete && isDefined(recordId))
      return await this.restApiDestroyOneHandler.commonHandle(request);
    if (isCommonApiEnabled && !isSoftDelete && !isDefined(recordId))
      return await this.restApiDestroyManyHandler.handle(request);

    if (isCommonApiEnabled && isSoftDelete && isDefined(recordId))
      return await this.restApiDeleteOneHandler.handle(request);
    if (isCommonApiEnabled && isSoftDelete && !isDefined(recordId))
      return await this.restApiDeleteManyHandler.handle(request);

    if (!isCommonApiEnabled && !isSoftDelete && isDefined(recordId))
      return await this.restApiDestroyOneHandler.handle(request);

    throw new BadRequestException(
      'Activate feature flag IS_COMMON_API_ENABLED to use Delete in the REST API',
    );
  }
}
