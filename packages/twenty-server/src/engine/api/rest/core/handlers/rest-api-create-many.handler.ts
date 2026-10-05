import { Injectable } from '@nestjs/common';
import { type ObjectRecord } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { parseFieldsRestRequest } from 'src/engine/api/rest/input-request-parsers/fields-parser-utils/parse-fields-rest-request.util';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { pickRestResponseFields } from 'src/engine/api/rest/core/utils/pick-rest-response-fields.util';
import { CommonCreateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/common-create-many-query-runner.service';
import { RestApiBaseHandler } from 'src/engine/api/rest/core/handlers/rest-api-base.handler';
import { parseDepthRestRequest } from 'src/engine/api/rest/input-request-parsers/depth-parser-utils/parse-depth-rest-request.util';
import { parseUpsertRestRequest } from 'src/engine/api/rest/input-request-parsers/upsert-parser-utils/parse-upsert-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request.type';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';
@Injectable()
export class RestApiCreateManyHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonCreateManyQueryRunnerService: CommonCreateManyQueryRunnerService,
  ) {
    super();
  }

  async handle(request: AuthenticatedRequest) {
    try {
      const { data, depth, requestedFields, upsert } =
        this.parseRequestArgs(request);

      const {
        authContext,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatIndexMaps,
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
        await this.commonCreateManyQueryRunnerService.execute(
          { data, selectedFields, upsert },
          {
            authContext,
            flatObjectMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            flatIndexMaps,
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
        [`create${capitalize(objectNamePlural)}`]: records.map((record) =>
          pickRestResponseFields({ record, selectedFields }),
        ),
      },
    };
  }

  private parseRequestArgs(request: AuthenticatedRequest) {
    return {
      requestedFields: parseFieldsRestRequest(request),
      data: request.body,
      depth: parseDepthRestRequest(request),
      upsert: parseUpsertRestRequest(request),
    };
  }
}
