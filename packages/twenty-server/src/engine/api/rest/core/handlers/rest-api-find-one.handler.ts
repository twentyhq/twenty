import { BadRequestException, Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { AuthenticatedRequest } from 'src/engine/api/rest/core/interfaces/authenticated-request.interface';
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

  async handle(request: AuthenticatedRequest) {
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

  private async buildCommonArgsAndOptionsFromRestRequest(
    request: AuthenticatedRequest,
  ) {
    const { id: recordId, object: parsedObject } = parseCorePath(request);

    if (!isDefined(recordId)) {
      throw new BadRequestException(
        'No recordId provided in rest api get one query',
      );
    }

    const depth = this.depthInputFactory.create(request);

    const { objectMetadataMaps, objectMetadataMapItem } =
      await this.restApiRequestContextService.getObjectMetadata(
        request,
        parsedObject,
      );

    const objectsPermissions =
      await this.restApiRequestContextService.getObjectsRecordPermissions(
        request,
      );

    const selectedFieldsResult =
      this.computeSelectedFieldsService.computeSelectedFields({
        objectsPermissions,
        objectMetadataMaps,
        objectMetadataMapItem,
        depth,
      });

    const { filter } = this.getVariablesFactory.create(recordId, request, {
      objectMetadataMaps,
      objectMetadataMapItem,
    });

    const authContext = this.getAuthContextFromRequest(request);

    return {
      args: {
        selectedFieldsResult,
        filter,
      },
      options: {
        authContext: authContext,
        objectMetadataItemWithFieldMaps: objectMetadataMapItem,
        objectMetadataMaps: objectMetadataMaps,
      },
    };
  }
}
