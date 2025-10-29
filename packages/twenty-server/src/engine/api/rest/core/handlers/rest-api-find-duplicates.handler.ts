import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/handlers/rest-api-base.handler';

import { CommonFindDuplicatesQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-duplicates-query-runner.service';
import { parseDepthRestRequest } from 'src/engine/api/rest/input-request-parsers/depth-parser-utils/parse-depth-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';

@Injectable()
export class RestApiFindDuplicatesHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonFindDuplicatesQueryRunnerService: CommonFindDuplicatesQueryRunnerService,
  ) {
    super();
  }

  async handle(request: AuthenticatedRequest) {
    try {
      const { data, ids, depth } = this.parseRequestArgs(request);

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

      const duplicateConnections =
        await this.commonFindDuplicatesQueryRunnerService.execute(
          { data, ids, selectedFields },
          {
            authContext,
            objectMetadataMaps,
            objectMetadataItemWithFieldMaps,
          },
        );

      return this.formatRestResponse(
        duplicateConnections,
        objectMetadataItemWithFieldMaps.nameSingular,
      );
    } catch (error) {
      return workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  private formatRestResponse(
    duplicateConnections: Array<{
      records: ObjectRecord[];
      totalCount: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    }>,
    objectNameSingular: string,
  ) {
    return {
      data: duplicateConnections.map((connection) => ({
        [`${objectNameSingular}Duplicates`]: connection.records,
        totalCount: connection.totalCount,
        pageInfo: {
          hasNextPage: connection.hasNextPage,
          hasPreviousPage: connection.hasPreviousPage,
          startCursor: connection.startCursor,
          endCursor: connection.endCursor,
        },
      })),
    };
  }

  private parseRequestArgs(request: AuthenticatedRequest) {
    return {
      data: request.body.data,
      ids: request.body.ids,
      depth: parseDepthRestRequest(request),
    };
  }
}
