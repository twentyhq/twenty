import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import isEmpty from 'lodash.isempty';
import { ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { CommonCreateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-one-query-runner.service';
import { parseDepthRestRequest } from 'src/engine/api/rest/input-request-parsers/depth-parser-utils/parse-depth-rest-request.util';
import { parseUpsertRestRequest } from 'src/engine/api/rest/input-request-parsers/upsert-parser-utils/parse-upsert-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';
import { getAllSelectableFields } from 'src/engine/api/utils/get-all-selectable-fields.utils';

@Injectable()
export class RestApiCreateOneHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonCreateOneQueryRunnerService: CommonCreateOneQueryRunnerService,
  ) {
    super();
  }

  async commonHandle(request: AuthenticatedRequest) {
    try {
      const { data, depth, upsert } = this.parseRequestArgs(request);

      const {
        authContext,
        objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      } = await this.buildCommonOptions(request);

      const selectedFields = await this.computeSelectedFields({
        depth,
        objectMetadataMapItem: objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
        authContext,
      });

      const record = await this.commonCreateOneQueryRunnerService.run({
        args: { data, selectedFields, upsert },
        authContext,
        objectMetadataMaps,
        objectMetadataItemWithFieldMaps,
      });

      return this.formatRestResponse(
        record,
        objectMetadataItemWithFieldMaps.nameSingular,
      );
    } catch (error) {
      workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  private formatRestResponse(record: ObjectRecord, objectNameSingular: string) {
    return { data: { [objectNameSingular]: record } };
  }

  private parseRequestArgs(request: AuthenticatedRequest) {
    return {
      data: request.body,
      depth: parseDepthRestRequest(request),
      upsert: parseUpsertRestRequest(request),
    };
  }

  async handle(request: AuthenticatedRequest) {
    const { objectMetadata, repository, restrictedFields } =
      await this.getRepositoryAndMetadataOrFail(request);

    const overriddenBody = await this.recordInputTransformerService.process({
      recordInput: request.body,
      objectMetadataMapItem: objectMetadata.objectMetadataMapItem,
    });

    const recordExists =
      isDefined(overriddenBody.id) &&
      (await repository.exists({
        where: {
          id: overriddenBody.id,
        },
      }));

    if (recordExists) {
      throw new BadRequestException('Record already exists');
    }

    const [recordToCreate] =
      await this.createdByFromAuthContextService.injectCreatedBy(
        [overriddenBody],
        objectMetadata.objectMetadataMapItem.nameSingular,
        this.getAuthContextFromRequest(request),
      );

    let selectedColumns = undefined;

    if (!isEmpty(restrictedFields)) {
      const selectableFields = getAllSelectableFields({
        restrictedFields,
        objectMetadata,
      });

      selectedColumns = Object.keys(selectableFields).filter(
        (key) => selectableFields[key],
      );
    }

    const createdRecordResult = await repository.insert(
      recordToCreate,
      undefined,
      selectedColumns,
    );
    const createdRecord = createdRecordResult.identifiers[0];

    const records = await this.getRecord({
      recordIds: [createdRecord.id],
      repository,
      objectMetadata,
      depth: parseDepthRestRequest(request),
      restrictedFields,
    });

    const record = records[0];

    if (!isDefined(record)) {
      throw new InternalServerErrorException('Created record not found');
    }

    return this.formatResult({
      operation: 'create',
      objectNameSingular: objectMetadata.objectMetadataMapItem.nameSingular,
      data: record,
    });
  }
}
