import { Injectable } from '@nestjs/common';

import { ObjectRecord } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { CommonUpdateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-many-query-runner.service';
import { parseDepthRestRequest } from 'src/engine/api/rest/input-request-parsers/depth-parser-utils/parse-depth-rest-request.util';
import { parseFilterRestRequest } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-filter-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';

@Injectable()
export class RestApiUpdateManyHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonUpdateManyQueryRunnerService: CommonUpdateManyQueryRunnerService,
  ) {
    super();
  }

  async handle(request: AuthenticatedRequest) {
    try {
      const { data, depth, filter } = this.parseRequestArgs(request);

      const {
        authContext,
        objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      } = await this.buildCommonOptions(request);

      const selectedFields = await this.computeSelectedFields({
        depth,
        objectMetadataMapItem: objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
        authContext,
      });

      const records = await this.commonUpdateManyQueryRunnerService.run({
        args: { data, filter, selectedFields },
        authContext,
        objectMetadataMaps,
        objectMetadataItemWithFieldMaps,
      });

      return this.formatRestResponse(
        records,
        objectMetadataItemWithFieldMaps.namePlural,
      );
    } catch (error) {
      return workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  private formatRestResponse(
    records: ObjectRecord[],
    objectNamePlural: string,
  ) {
    return {
      data: {
        [`update${capitalize(objectNamePlural)}`]: records,
      },
    };
  }

  private parseRequestArgs(request: AuthenticatedRequest) {
    return {
      data: request.body,
      depth: parseDepthRestRequest(request),
      filter: parseFilterRestRequest(request),
    };
  }
}
