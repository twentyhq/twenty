import { BadRequestException, Injectable } from '@nestjs/common';
import { ObjectRecord } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { parseFieldsRestRequest } from 'src/engine/api/rest/input-request-parsers/fields-parser-utils/parse-fields-rest-request.util';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { CommonUpdateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-one-query-runner.service';
import { RestApiBaseHandler } from 'src/engine/api/rest/core/handlers/rest-api-base.handler';
import { pickRestResponseFields } from 'src/engine/api/rest/core/utils/pick-rest-response-fields.util';
import { parseDepthRestRequest } from 'src/engine/api/rest/input-request-parsers/depth-parser-utils/parse-depth-rest-request.util';
import { parseCorePath } from 'src/engine/api/rest/input-request-parsers/path-parser-utils/parse-core-path.utils';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request.type';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';

@Injectable()
export class RestApiUpdateOneHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonUpdateOneQueryRunnerService: CommonUpdateOneQueryRunnerService,
  ) {
    super();
  }

  async handle(request: AuthenticatedRequest) {
    try {
      const { id, data, depth, requestedFields } =
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

      const { results: record } =
        await this.commonUpdateOneQueryRunnerService.execute(
          { id, data, selectedFields },
          {
            authContext,
            flatObjectMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            objectIdByNameSingular,
          },
        );

      return this.formatRestResponse({
        record,
        objectNameSingular: flatObjectMetadata.nameSingular,
        selectedFields,
      });
    } catch (error) {
      return workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  private formatRestResponse({
    record,
    objectNameSingular,
    selectedFields,
  }: {
    record: ObjectRecord;
    objectNameSingular: string;
    selectedFields: CommonSelectedFields;
  }) {
    return {
      data: {
        [`update${capitalize(objectNameSingular)}`]: pickRestResponseFields({
          record,
          selectedFields,
        }),
      },
    };
  }

  private parseRequestArgs(request: AuthenticatedRequest) {
    const { id } = parseCorePath(request);

    if (!id) {
      throw new BadRequestException('Record ID not found');
    }

    return {
      requestedFields: parseFieldsRestRequest(request),
      id,
      data: request.body,
      depth: parseDepthRestRequest(request),
    };
  }
}
