import { Injectable } from '@nestjs/common';
import { ObjectRecord } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { parseFieldsRestRequest } from 'src/engine/api/rest/input-request-parsers/fields-parser-utils/parse-fields-rest-request.util';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { pickRestResponseFields } from 'src/engine/api/rest/core/utils/pick-rest-response-fields.util';
import { CommonRestoreManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-restore-many-query-runner.service';
import { RestApiBaseHandler } from 'src/engine/api/rest/core/handlers/rest-api-base.handler';
import { parseDepthRestRequest } from 'src/engine/api/rest/input-request-parsers/depth-parser-utils/parse-depth-rest-request.util';
import { parseFilterRestRequest } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-filter-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request.type';
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
      const { filter, depth, requestedFields } = this.parseRequestArgs(request);

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

      const { results: records } =
        await this.commonRestoreManyQueryRunnerService.execute(
          { filter, selectedFields },
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
        objectNamePlural: flatObjectMetadata.namePlural,
        selectedFields,
      });
    } catch (error) {
      return workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  private formatRestResponse({
    records,
    objectNamePlural,
    selectedFields,
  }: {
    records: ObjectRecord[];
    objectNamePlural: string;
    selectedFields: CommonSelectedFields;
  }) {
    return {
      data: {
        [`restore${capitalize(objectNamePlural)}`]: records.map((record) =>
          pickRestResponseFields({ record, selectedFields }),
        ),
      },
    };
  }

  private parseRequestArgs(request: AuthenticatedRequest) {
    const filter = parseFilterRestRequest(request);

    return {
      requestedFields: parseFieldsRestRequest(request),
      filter,
      depth: parseDepthRestRequest(request),
    };
  }
}
