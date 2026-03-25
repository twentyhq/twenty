import { Injectable } from '@nestjs/common';

import { DEFAULT_NUMBER_OF_GROUPS_LIMIT } from 'twenty-shared/constants';

import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { RestApiBaseHandler } from 'src/engine/api/rest/core/handlers/rest-api-base.handler';
import { parseAggregateFieldsRestRequest } from 'src/engine/api/rest/input-request-parsers/aggregate-fields-parser-utils/parse-aggregate-fields-rest-request.util';
import { parseFilterRestRequest } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-filter-rest-request.util';
import { parseGroupByRestRequest } from 'src/engine/api/rest/input-request-parsers/group-by-parser-utils/parse-group-by-rest-request.util';
import { parseIncludeRecordsSampleRestRequest } from 'src/engine/api/rest/input-request-parsers/group-by-with-records/parse-include-records-sample-rest-request.util';
import { parseLimitRestRequest } from 'src/engine/api/rest/input-request-parsers/limit-parser-utils/parse-limit-rest-request.util';
import { parseOrderByForRecordsWithGroupByRestRequest } from 'src/engine/api/rest/input-request-parsers/order-by-with-group-by-parser-utils/parse-order-by-for-records-rest-request.util';
import { parseOrderByWithGroupByRestRequest } from 'src/engine/api/rest/input-request-parsers/order-by-with-group-by-parser-utils/parse-order-by-with-group-by-rest-request.util';
import { parseViewIdRestRequest } from 'src/engine/api/rest/input-request-parsers/view-id-parser-utils/parse-view-id-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';

@Injectable()
export class RestApiGroupByHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonGroupByQueryRunnerService: CommonGroupByQueryRunnerService,
  ) {
    super();
  }

  async handle(request: AuthenticatedRequest) {
    try {
      const {
        filter,
        orderBy,
        viewId,
        groupBy,
        selectedFields,
        authContext,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular,
        includeRecords,
        orderByForRecords,
        limit,
      } = await this.parseRequestArgs(request);

      return await this.commonGroupByQueryRunnerService.execute(
        {
          filter,
          orderBy,
          viewId,
          groupBy,
          selectedFields,
          limit,
          includeRecords,
          orderByForRecords,
        },
        {
          authContext,
          flatObjectMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          objectIdByNameSingular,
        },
      );
    } catch (error) {
      return workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  private async parseRequestArgs(request: AuthenticatedRequest) {
    const {
      authContext,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    } = await this.buildCommonOptions(request);

    const orderByWithGroupBy = parseOrderByWithGroupByRestRequest(request);
    const orderByForRecordsWithGroupBy =
      parseOrderByForRecordsWithGroupByRestRequest(request);
    const filter = parseFilterRestRequest(request);
    const viewId = parseViewIdRestRequest(request);
    const groupBy = parseGroupByRestRequest(request);
    const includeRecords = parseIncludeRecordsSampleRestRequest(request);
    const aggregateFields = parseAggregateFieldsRestRequest(request);
    const limit = parseLimitRestRequest(
      request,
      DEFAULT_NUMBER_OF_GROUPS_LIMIT,
    );
    let selectedFields = { ...aggregateFields, groupByDimensionValues: true };

    if (includeRecords) {
      const selectableFields = await this.computeSelectedFields({
        depth: 0,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        authContext,
      });

      selectedFields = { ...selectedFields, ...selectableFields };
    }

    return {
      authContext,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
      filter,
      orderBy: orderByWithGroupBy,
      orderByForRecords: orderByForRecordsWithGroupBy,
      viewId,
      groupBy,
      selectedFields,
      includeRecords,
      limit,
    };
  }
}
