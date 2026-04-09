import { Injectable } from '@nestjs/common';

import { ObjectRecord } from 'twenty-shared/types';

import {
  PageInfo,
  RestApiBaseHandler,
} from 'src/engine/api/rest/core/handlers/rest-api-base.handler';
import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { parseDepthRestRequest } from 'src/engine/api/rest/input-request-parsers/depth-parser-utils/parse-depth-rest-request.util';
import { parseEndingBeforeRestRequest } from 'src/engine/api/rest/input-request-parsers/ending-before-parser-utils/parse-ending-before-rest-request.util';
import { parseFilterRestRequest } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-filter-rest-request.util';
import { parseLimitRestRequest } from 'src/engine/api/rest/input-request-parsers/limit-parser-utils/parse-limit-rest-request.util';
import { parseOrderByRestRequest } from 'src/engine/api/rest/input-request-parsers/order-by-parser-utils/parse-order-by-rest-request.util';
import { parseStartingAfterRestRequest } from 'src/engine/api/rest/input-request-parsers/starting-after-parser-utils/parse-starting-after-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';

@Injectable()
export class RestApiFindManyHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonFindManyQueryRunnerService: CommonFindManyQueryRunnerService,
  ) {
    super();
  }

  async handle(request: AuthenticatedRequest) {
    try {
      const parsedArgs = this.parseRequestArgs(request);
      const {
        authContext,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular,
      } = await this.buildCommonOptions(request);

      const selectedFields = await this.computeSelectedFields({
        depth: parsedArgs.depth,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        authContext,
      });

      const { records, aggregatedValues, pageInfo } =
        await this.commonFindManyQueryRunnerService.execute(
          {
            ...parsedArgs,
            selectedFields: { ...selectedFields, totalCount: true },
          },
          {
            authContext,
            flatObjectMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            objectIdByNameSingular,
          },
        );

      return this.formatRestResponse(
        records,
        aggregatedValues,
        flatObjectMetadata.namePlural,
        pageInfo,
      );
    } catch (error) {
      return workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  private formatRestResponse(
    records: ObjectRecord[],
    aggregatedValues: Record<string, number>,
    objectNamePlural: string,
    pageInfo: PageInfo,
  ) {
    return {
      data: {
        [objectNamePlural]: records,
      },
      totalCount: Number(aggregatedValues.totalCount),
      pageInfo,
    };
  }

  private parseRequestArgs(request: AuthenticatedRequest) {
    const depth = parseDepthRestRequest(request);
    const limit = parseLimitRestRequest(request);
    const orderBy = parseOrderByRestRequest(request);
    const filter = parseFilterRestRequest(request);
    const endingBefore = parseEndingBeforeRestRequest(request);
    const startingAfter = parseStartingAfterRestRequest(request);

    return {
      filter,
      orderBy,
      first: !endingBefore ? limit : undefined,
      last: endingBefore ? limit : undefined,
      before: endingBefore,
      after: startingAfter,
      depth,
    };
  }
}
