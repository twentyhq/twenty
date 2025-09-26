import { BadRequestException, Injectable } from '@nestjs/common';

import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { CommonFindOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-one-query-runner.service';
import { CommonQueryNames } from 'src/engine/api/common/types/common-query-args.type';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';

@Injectable()
export class RestApiFindOneHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonFindOneQueryRunnerService: CommonFindOneQueryRunnerService,
  ) {
    super();
  }

  async handle(request: Request) {
    try {
      const { args, options } =
        await this.buildCommonArgsAndOptionsFromRestRequest(request);

      const record = await this.commonFindOneQueryRunnerService.execute(
        args,
        options,
        CommonQueryNames.findOne,
      );

      return this.formatResult({
        operation: CommonQueryNames.findOne,
        objectNameSingular:
          options.objectMetadataItemWithFieldMaps.nameSingular,
        data: record,
      });
    } catch (error) {
      workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  private async buildCommonArgsAndOptionsFromRestRequest(request: Request) {
    const { id: recordId } = parseCorePath(request);

    if (!isDefined(recordId)) {
      throw new BadRequestException(
        'No recordId provided in rest api get one query',
      );
    }

    const {
      objectMetadata,
      objectMetadataItemWithFieldsMaps,
      authContext,
      objectsPermissions,
    } = await this.getRepositoryAndMetadataOrFail(request);

    const selectedFieldsResult =
      this.computeSelectedFieldsService.computeSelectedFields({
        objectsPermissions,
        objectsMetadataMaps: objectMetadata.objectMetadataMaps,
        objectMetadataMapItem: objectMetadataItemWithFieldsMaps,
        depth: this.depthInputFactory.create(request),
      });

    const { filter } = this.getVariablesFactory.create(
      recordId,
      request,
      objectMetadata,
    );

    return {
      args: {
        selectedFieldsResult,
        filter,
      },
      options: {
        authContext: authContext,
        objectMetadataItemWithFieldMaps: objectMetadataItemWithFieldsMaps,
        objectMetadataMaps: objectMetadata.objectMetadataMaps,
      },
    };
  }
}
