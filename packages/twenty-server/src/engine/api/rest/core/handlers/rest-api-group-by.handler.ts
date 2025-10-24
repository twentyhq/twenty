import { Injectable } from '@nestjs/common';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { parseAggregateFieldsRestRequest } from 'src/engine/api/rest/input-request-parsers/aggregate-fields-parser-utils/parse-aggregate-fields-rest-request.util';
import { parseFilterRestRequest } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-filter-rest-request.util';
import { parseGroupByRestRequest } from 'src/engine/api/rest/input-request-parsers/group-by-parser-utils/parse-group-by-rest-request.util';
import { parseIncludeRecordsSampleRestRequest } from 'src/engine/api/rest/input-request-parsers/group-by-with-records/parse-include-records-sample-rest-request.util';
import { parseOmitNullValuesRestRequest } from 'src/engine/api/rest/input-request-parsers/omit-null-values-parser-utils/parse-omit-null-values-rest-request.util';
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
        includeRecords,
        omitNullValues,
        authContext,
        objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      } = await this.parseRequestArgs(request);

      return await this.commonGroupByQueryRunnerService.run({
        args: {
          filter,
          orderBy,
          viewId,
          groupBy,
          selectedFields,
          omitNullValues,
        },
        authContext,
        objectMetadataMaps,
        objectMetadataItemWithFieldMaps,
        shouldIncludeRecords: includeRecords,
      });
    } catch (error) {
      throw workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  private async parseRequestArgs(request: AuthenticatedRequest) {
    const orderByWithGroupBy = parseOrderByWithGroupByRestRequest(request);
    const filter = parseFilterRestRequest(request);
    const viewId = parseViewIdRestRequest(request);
    const groupBy = parseGroupByRestRequest(request);
    const aggregateFields = parseAggregateFieldsRestRequest(request);
    const omitNullValues = parseOmitNullValuesRestRequest(request);
    const includeRecords = parseIncludeRecordsSampleRestRequest(request);
    let selectedFields = { ...aggregateFields, groupByDimensionValues: true };

    const { authContext, objectMetadataItemWithFieldMaps, objectMetadataMaps } =
      await this.buildCommonOptions(request);

    if (includeRecords) {
      const selectableFields = await this.computeSelectedFields({
        depth: 0,
        objectMetadataMapItem: objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
        authContext,
      });

      selectedFields = { ...selectedFields, ...selectableFields };
    }

    return {
      authContext,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
      filter,
      orderBy: orderByWithGroupBy,
      viewId,
      groupBy,
      selectedFields,
      omitNullValues,
      includeRecords,
    };
  }
}
