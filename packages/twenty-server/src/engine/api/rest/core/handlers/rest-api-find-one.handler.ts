import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { CommonFindOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-one-query-runner.service';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';

@Injectable()
export class RestApiFindOneHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonFindOneQueryRunnerService: CommonFindOneQueryRunnerService,
  ) {
    super();
  }

  async handle(request: Request) {
    try {
      const { args, rawSelectedFields } = await this.parseCommonArgs(request);
      const options = await this.buildCommonOptions(request);

      const record = await this.commonFindOneQueryRunnerService.run(
        rawSelectedFields,
        args,
        options,
      );

      return this.formatRestResponse(
        record,
        options.objectMetadataItemWithFieldMaps.nameSingular,
      );
    } catch (error) {
      workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  private formatRestResponse(record: ObjectRecord, objectNameSingular: string) {
    return { data: { [objectNameSingular]: record } };
  }

  private async parseCommonArgs(request: Request) {
    const { id: recordId } = parseCorePath(request);
    const filter = { id: { eq: recordId } };
    const depth = this.depthInputFactory.create(request);

    return {
      args: {
        filter,
      },
      rawSelectedFields: {
        depth,
      },
    };
  }

  private async buildCommonOptions(request: Request) {
    const { object: parsedObject } = parseCorePath(request);

    const { objectMetadataMaps, objectMetadataMapItem } =
      await this.coreQueryBuilderFactory.getObjectMetadata(
        request,
        parsedObject,
      );

    const authContext = this.getAuthContextFromRequest(request);

    return {
      authContext: authContext,
      objectMetadataItemWithFieldMaps: objectMetadataMapItem,
      objectMetadataMaps: objectMetadataMaps,
    };
  }
}
