import { Injectable } from '@nestjs/common';

import { ObjectRecord } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/handlers/rest-api-base.handler';
import { CommonRestoreManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-restore-many-query-runner.service';
import { parseDepthRestRequest } from 'src/engine/api/rest/input-request-parsers/depth-parser-utils/parse-depth-rest-request.util';
import { parseFilterRestRequest } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-filter-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';

@Injectable()
export class RestApiRestoreManyHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonRestoreManyQueryRunnerService: CommonRestoreManyQueryRunnerService,
  ) {
    super();
  }

  async handle(request: AuthenticatedRequest): Promise<{
    data: {
      [x: string]: ObjectRecord[];
    };
  }> {
    try {
      const { filter, depth } = this.parseRequestArgs(request);

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

      const records = await this.commonRestoreManyQueryRunnerService.execute(
        { filter, selectedFields },
        {
          authContext,
          objectMetadataMaps,
          objectMetadataItemWithFieldMaps,
        },
      );

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
        [`restore${capitalize(objectNamePlural)}`]: records,
      },
    };
  }

  private parseRequestArgs(request: AuthenticatedRequest) {
    const filter = parseFilterRestRequest(request);

    return {
      filter,
      depth: parseDepthRestRequest(request),
    };
  }
}
