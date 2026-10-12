import { Injectable } from '@nestjs/common';
import { ObjectRecord } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { parseFieldsRestRequest } from 'src/engine/api/rest/input-request-parsers/fields-parser-utils/parse-fields-rest-request.util';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { RestApiBaseHandler } from 'src/engine/api/rest/core/handlers/rest-api-base.handler';
import { CommonUpdateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-many-query-runner.service';
import { pickRestResponseFields } from 'src/engine/api/rest/core/utils/pick-rest-response-fields.util';
import { parseDepthRestRequest } from 'src/engine/api/rest/input-request-parsers/depth-parser-utils/parse-depth-rest-request.util';
import { parseFilterRestRequest } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-filter-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request.type';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';

@Injectable()
export class RestApiUpdateManyHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonUpdateManyQueryRunnerService: CommonUpdateManyQueryRunnerService,
  ) {
    super();
  }

  async handle(request: AuthenticatedRequest) {
    try {
      const { data, depth, requestedFields, filter } =
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

      const { results: records } =
        await this.commonUpdateManyQueryRunnerService.execute(
          { data, filter, selectedFields },
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
        [`update${capitalize(objectNamePlural)}`]: records.map((record) =>
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
      filter: parseFilterRestRequest(request),
    };
  }
}
