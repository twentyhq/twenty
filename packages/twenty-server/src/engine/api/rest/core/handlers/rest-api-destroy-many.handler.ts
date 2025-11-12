import { Injectable } from '@nestjs/common';

import { ObjectRecord } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/handlers/rest-api-base.handler';
import { CommonDestroyManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-destroy-many-query-runner.service';
import { parseFilterRestRequest } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-filter-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';

@Injectable()
export class RestApiDestroyManyHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonDestroyManyQueryRunnerService: CommonDestroyManyQueryRunnerService,
  ) {
    super();
  }

  async handle(request: AuthenticatedRequest): Promise<{
    data: {
      [x: string]: ObjectRecord[];
    };
  }> {
    const { filter } = this.parseRequestArgs(request);
    const { authContext, objectMetadataItemWithFieldMaps, objectMetadataMaps } =
      await this.buildCommonOptions(request);

    try {
      const records = await this.commonDestroyManyQueryRunnerService.execute(
        { filter, selectedFields: { id: true } },
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
        [`delete${capitalize(objectNamePlural)}`]: records,
      },
    };
  }

  private parseRequestArgs(request: AuthenticatedRequest) {
    const filter = parseFilterRestRequest(request);

    return {
      filter,
    };
  }
}
