import { BadRequestException, Injectable } from '@nestjs/common';

import { ObjectRecord } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { CommonDeleteOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-delete-one-query-runner.service';
import { RestApiBaseHandler } from 'src/engine/api/rest/core/handlers/rest-api-base.handler';
import { parseCorePath } from 'src/engine/api/rest/input-request-parsers/path-parser-utils/parse-core-path.utils';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';

@Injectable()
export class RestApiDeleteOneHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonDeleteOneQueryRunnerService: CommonDeleteOneQueryRunnerService,
  ) {
    super();
  }

  async handle(request: AuthenticatedRequest) {
    try {
      const { id } = this.parseRequestArgs(request);

      const {
        authContext,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular,
      } = await this.buildCommonOptions(request);

      const record = await this.commonDeleteOneQueryRunnerService.execute(
        { id, selectedFields: { id: true } },
        {
          authContext,
          flatObjectMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          objectIdByNameSingular,
        },
      );

      return this.formatRestResponse(record, flatObjectMetadata.nameSingular);
    } catch (error) {
      return workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  private formatRestResponse(record: ObjectRecord, objectNameSingular: string) {
    return {
      data: { [`delete${capitalize(objectNameSingular)}`]: record },
    };
  }

  private parseRequestArgs(request: AuthenticatedRequest) {
    const { id } = parseCorePath(request);

    if (!isDefined(id)) {
      throw new BadRequestException('Record ID not found');
    }

    return {
      id,
    };
  }
}
