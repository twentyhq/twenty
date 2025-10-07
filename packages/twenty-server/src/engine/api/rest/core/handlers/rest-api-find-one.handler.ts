import { BadRequestException, Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { CommonFindOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-one-query-runner.service';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';

@Injectable()
export class RestApiFindOneHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonFindOneQueryRunnerService: CommonFindOneQueryRunnerService,
  ) {
    super();
  }

  async handle(request: AuthenticatedRequest) {
    const { id: recordId } = parseCorePath(request);

    if (!isDefined(recordId)) {
      throw new BadRequestException(
        'No recordId provided in rest api get one query',
      );
    }

    const {
      repository,
      objectMetadata,
      objectMetadataItemWithFieldsMaps,
      restrictedFields,
    } = await this.getRepositoryAndMetadataOrFail(request);

    const { records } = await this.findRecords({
      request,
      recordId,
      repository,
      objectMetadata,
      objectMetadataItemWithFieldsMaps,
      restrictedFields,
    });

    const record = records?.[0];

    if (!isDefined(record)) {
      throw new BadRequestException('Record not found');
    }

    return this.formatResult({
      operation: 'findOne',
      objectNameSingular: objectMetadata.objectMetadataMapItem.nameSingular,
      data: record,
    });
  }

  async commonHandle(request: AuthenticatedRequest) {
    try {
      const { filter, depth } = await this.parseRequestArgs(request);
      const {
        authContext,
        objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      } = await this.buildCommonOptions(request);

      const selectedFieldsResult = await this.computeSelectedFields({
        depth,
        objectMetadataMapItem: objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
        authContext,
      });

      const record = await this.commonFindOneQueryRunnerService.run({
        args: { filter, selectedFieldsResult },
        authContext,
        objectMetadataMaps,
        objectMetadataItemWithFieldMaps,
      });

      return this.formatRestResponse(
        record,
        objectMetadataItemWithFieldMaps.nameSingular,
      );
    } catch (error) {
      return workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  private formatRestResponse(record: ObjectRecord, objectNameSingular: string) {
    return { data: { [objectNameSingular]: record } };
  }

  private async parseRequestArgs(request: AuthenticatedRequest) {
    const { id: recordId } = parseCorePath(request);
    const filter = { id: { eq: recordId } };
    const depth = this.depthInputFactory.create(request);

    return {
      filter,
      depth,
    };
  }

  private async buildCommonOptions(request: AuthenticatedRequest) {
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
