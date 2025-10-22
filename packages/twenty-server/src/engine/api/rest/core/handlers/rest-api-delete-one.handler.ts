import { BadRequestException, Injectable } from '@nestjs/common';

import { ObjectRecord } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { CommonDeleteOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-delete-one-query-runner.service';
import { CommonQueryNames } from 'src/engine/api/common/types/common-query-args.type';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { parseDepthRestRequest } from 'src/engine/api/rest/input-request-parsers/depth-parser-utils/parse-depth-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';

@Injectable()
export class RestApiDeleteOneHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonDeleteOneQueryRunnerService: CommonDeleteOneQueryRunnerService,
  ) {
    super();
  }

  async handle(request: AuthenticatedRequest) {
    try {
      const { id } = this.parseRequestArgs(request);

      const {
        authContext,
        objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      } = await this.buildCommonOptions(request);

      const selectedFields = await this.computeSelectedFields({
        objectMetadataMapItem: objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
        authContext,
      });

      const record = await this.commonDeleteOneQueryRunnerService.execute(
        { id, selectedFields },
        {
          authContext,
          objectMetadataMaps,
          objectMetadataItemWithFieldMaps,
        },
        CommonQueryNames.DELETE_ONE,
      );

      return this.formatRestResponse(
        record,
        objectMetadataItemWithFieldMaps.nameSingular,
      );
    } catch (error) {
      return workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  private formatRestResponse(record: ObjectRecord, objectNameSingular: string) {
    return {
      data: { [`delete${capitalize(objectNameSingular)}`]: record },
      softDelete: true,
    };
  }

  private parseRequestArgs(request: AuthenticatedRequest) {
    const { id } = parseCorePath(request);

    if (!isDefined(id)) {
      throw new BadRequestException('Record ID not found');
    }

    return {
      id,
      depth: parseDepthRestRequest(request),
    };
  }
}
