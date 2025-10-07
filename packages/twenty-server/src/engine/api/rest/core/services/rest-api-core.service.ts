import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { RestApiCreateManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-create-many.handler';
import { RestApiCreateOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-create-one.handler';
import { RestApiDeleteOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-delete-one.handler';
import { RestApiFindDuplicatesHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-duplicates.handler';
import { RestApiFindManyHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-many.handler';
import { RestApiFindOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-find-one.handler';
import { RestApiUpdateOneHandler } from 'src/engine/api/rest/core/handlers/rest-api-update-one.handler';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';

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
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async delete(request: AuthenticatedRequest) {
    return await this.restApiDeleteOneHandler.handle(request);
  }

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
    return await this.restApiUpdateOneHandler.handle(request);
  }

  async get(request: AuthenticatedRequest) {
    const { id: recordId } = parseCorePath(request);

    if (isDefined(recordId)) {
      const isCommonApiEnabled = await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_COMMON_API_ENABLED,
        request.workspace.id,
      );

      if (isCommonApiEnabled) {
        return await this.restApiFindOneHandler.commonHandle(request);
      }

      return await this.restApiFindOneHandler.handle(request);
    } else {
      return await this.restApiFindManyHandler.handle(request);
    }
  }
}
