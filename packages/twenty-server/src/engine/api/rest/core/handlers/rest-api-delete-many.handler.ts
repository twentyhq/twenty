import { Injectable } from '@nestjs/common';

import { ObjectRecord } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { CommonDeleteManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-delete-many-query-runner.service';
import { CommonQueryNames } from 'src/engine/api/common/types/common-query-args.type';
import { parseFilterRestRequest } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-filter-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';

@Injectable()
export class RestApiDeleteManyHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonDeleteManyQueryRunnerService: CommonDeleteManyQueryRunnerService,
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

    const selectedFields = await this.computeSelectedFields({
      objectMetadataMapItem: objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
      authContext,
    });

    try {
      const records = await this.commonDeleteManyQueryRunnerService.execute(
        { filter, selectedFields },
        {
          authContext,
          objectMetadataMaps,
          objectMetadataItemWithFieldMaps,
        },
        CommonQueryNames.DELETE_MANY,
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
      softDelete: true,
    };
  }

  private parseRequestArgs(request: AuthenticatedRequest) {
    const filter = parseFilterRestRequest(request);

    return {
      filter,
    };
  }
}
