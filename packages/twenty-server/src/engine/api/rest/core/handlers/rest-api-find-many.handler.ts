import { Injectable } from '@nestjs/common';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import {
  PageInfo,
  RestApiBaseHandler,
} from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

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
    const {
      repository,
      objectMetadata,
      objectMetadataItemWithFieldsMaps,
      restrictedFields,
    } = await this.getRepositoryAndMetadataOrFail(request);

    const {
      records,
      isForwardPagination,
      hasMoreRecords,
      totalCount,
      startCursor,
      endCursor,
    } = await this.findRecords({
      request,
      repository,
      objectMetadata,
      objectMetadataItemWithFieldsMaps,
      restrictedFields,
    });

    return this.formatPaginatedResult({
      finalRecords: records,
      objectMetadataNamePlural: objectMetadata.objectMetadataMapItem.namePlural,
      isForwardPagination,
      hasMoreRecords,
      totalCount,
      startCursor,
      endCursor,
    });
  }

  formatPaginatedResult({
    finalRecords,
    objectMetadataNamePlural,
    isForwardPagination,
    hasMoreRecords,
    totalCount,
    startCursor,
    endCursor,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    finalRecords: any[];
    objectMetadataNamePlural: string;
    isForwardPagination: boolean;
    hasMoreRecords: boolean;
    totalCount: number;
    startCursor: string | null;
    endCursor: string | null;
  }) {
    const hasPreviousPage = !isForwardPagination && hasMoreRecords;

    return this.formatResult({
      operation: 'findMany',
      objectNamePlural: objectMetadataNamePlural,
      data: isForwardPagination ? finalRecords : finalRecords.reverse(),
      pageInfo: {
        hasNextPage: isForwardPagination && hasMoreRecords,
        ...(hasPreviousPage ? { hasPreviousPage } : {}),
        startCursor,
        endCursor,
      },
      totalCount,
    });
  }

  async commonHandle(request: AuthenticatedRequest) {
    try {
      const parsedArgs = this.parseRequestArgs(request);
      const {
        authContext,
        objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      } = await this.buildCommonOptions(request);

      const selectedFieldsResult = await this.computeSelectedFields({
        depth: parsedArgs.depth,
        objectMetadataMapItem: objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
        authContext,
      });

      const { records, aggregatedValues, pageInfo } =
        await this.commonFindManyQueryRunnerService.run({
          args: { ...parsedArgs, selectedFieldsResult },
          authContext,
          objectMetadataMaps,
          objectMetadataItemWithFieldMaps,
        });

      return this.formatRestResponse(
        records,
        aggregatedValues,
        objectMetadataItemWithFieldMaps.namePlural,
        pageInfo,
      );
    } catch (error) {
      workspaceQueryRunnerRestApiExceptionHandler(error);
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
      totalCount: aggregatedValues.totalCount,
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
