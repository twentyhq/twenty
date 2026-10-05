import { Injectable } from '@nestjs/common';
import { ObjectRecord } from 'twenty-shared/types';

import { parseFieldsRestRequest } from 'src/engine/api/rest/input-request-parsers/fields-parser-utils/parse-fields-rest-request.util';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import {
  PageInfo,
  RestApiBaseHandler,
} from 'src/engine/api/rest/core/handlers/rest-api-base.handler';
import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { pickRestResponseFields } from 'src/engine/api/rest/core/utils/pick-rest-response-fields.util';
import { parseDepthRestRequest } from 'src/engine/api/rest/input-request-parsers/depth-parser-utils/parse-depth-rest-request.util';
import { parseEndingBeforeRestRequest } from 'src/engine/api/rest/input-request-parsers/ending-before-parser-utils/parse-ending-before-rest-request.util';
import { parseFilterRestRequest } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-filter-rest-request.util';
import { parseLimitRestRequest } from 'src/engine/api/rest/input-request-parsers/limit-parser-utils/parse-limit-rest-request.util';
import { parseOrderByRestRequest } from 'src/engine/api/rest/input-request-parsers/order-by-parser-utils/parse-order-by-rest-request.util';
import { parseStartingAfterRestRequest } from 'src/engine/api/rest/input-request-parsers/starting-after-parser-utils/parse-starting-after-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request.type';
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
      const { depth, requestedFields, ...queryArgs } =
        this.parseRequestArgs(request);
      const {
        authContext,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular,
      } = await this.buildCommonOptions(request);

      const { selectedFields } = await this.computeRecordSelectedFields({
        requestedFields,
        depth,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        authContext,
      });

      const {
        results: { records, aggregatedValues, pageInfo },
      } = await this.commonFindManyQueryRunnerService.execute(
        {
          ...queryArgs,
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

      return this.formatRestResponse({
        records,
        aggregatedValues,
        objectNamePlural: flatObjectMetadata.namePlural,
        pageInfo,
        selectedFields,
      });
    } catch (error) {
      return workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  private formatRestResponse({
    records,
    aggregatedValues,
    objectNamePlural,
    pageInfo,
    selectedFields,
  }: {
    records: ObjectRecord[];
    aggregatedValues: Record<string, number> | undefined;
    objectNamePlural: string;
    pageInfo: PageInfo;
    selectedFields: CommonSelectedFields;
  }) {
    return {
      data: {
        [objectNamePlural]: records.map((record) =>
          pickRestResponseFields({ record, selectedFields }),
        ),
      },
      totalCount: Number(aggregatedValues?.totalCount ?? 0),
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
      requestedFields: parseFieldsRestRequest(request),
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
