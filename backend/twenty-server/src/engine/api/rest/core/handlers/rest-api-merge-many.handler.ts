import { Injectable } from '@nestjs/common';

import { ObjectRecord } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { CommonMergeManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-merge-many-query-runner.service';
import { RestApiBaseHandler } from 'src/engine/api/rest/core/handlers/rest-api-base.handler';
import { parseDepthRestRequest } from 'src/engine/api/rest/input-request-parsers/depth-parser-utils/parse-depth-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';

@Injectable()
export class RestApiMergeManyHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonMergeManyQueryRunnerService: CommonMergeManyQueryRunnerService,
  ) {
    super();
  }

  async handle(request: AuthenticatedRequest) {
    try {
      const { depth, ...restArgs } = await this.parseRequestArgs(request);
      const {
        authContext,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular,
      } = await this.buildCommonOptions(request);

      const selectedFields = await this.computeSelectedFields({
        depth,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        authContext,
      });

      const record = await this.commonMergeManyQueryRunnerService.execute(
        { ...restArgs, selectedFields },
        {
          authContext,
          flatObjectMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          objectIdByNameSingular,
        },
      );

      return this.formatRestResponse(record, flatObjectMetadata.nameSingular);
    } catch (error) {
      return workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  private formatRestResponse(record: ObjectRecord, objectNamePlural: string) {
    return { data: { [`merge${capitalize(objectNamePlural)}`]: record } };
  }

  private async parseRequestArgs(request: AuthenticatedRequest) {
    const depth = parseDepthRestRequest(request);

    return {
      conflictPriorityIndex: request.body.conflictPriorityIndex,
      dryRun: request.body.dryRun,
      ids: request.body.ids,
      depth,
    };
  }
}
