import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import isEmpty from 'lodash.isempty';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { CommonCreateManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/common-create-many-query-runner.service';
import { parseDepthRestRequest } from 'src/engine/api/rest/input-request-parsers/depth-parser-utils/parse-depth-rest-request.util';
import { parseUpsertRestRequest } from 'src/engine/api/rest/input-request-parsers/upsert-parser-utils/parse-upsert-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';
import { getAllSelectableFields } from 'src/engine/api/utils/get-all-selectable-fields.utils';

@Injectable()
export class RestApiCreateManyHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonCreateManyQueryRunnerService: CommonCreateManyQueryRunnerService,
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

      const selectedFieldsResult = await this.computeSelectedFields({
        depth,
        objectMetadataMapItem: objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
        authContext,
      });

      const records = await this.commonCreateManyQueryRunnerService.run({
        args: { data, selectedFieldsResult, upsert },
        authContext,
        objectMetadataMaps,
        objectMetadataItemWithFieldMaps,
      });

      return this.formatRestResponse(
        records,
        objectMetadataItemWithFieldMaps.namePlural,
      );
    } catch (error) {
      workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  private formatRestResponse(
    records: ObjectRecord[],
    objectNamePlural: string,
  ) {
    return { data: { [objectNamePlural]: records } };
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

    const body = request.body;

    if (!Array.isArray(body)) {
      throw new BadRequestException('Body must be an array');
    }

    if (body.length === 0) {
      throw new BadRequestException('Input must not be empty');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const overriddenRecordsToCreate: Record<string, any>[] = [];

    for (const recordToCreate of body) {
      const overriddenBody = await this.recordInputTransformerService.process({
        recordInput: recordToCreate,
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

      overriddenRecordsToCreate.push(overriddenBody);
    }

    const recordsToCreate =
      await this.createdByFromAuthContextService.injectCreatedBy(
        overriddenRecordsToCreate,
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

    const createdRecords = await repository.insert(
      recordsToCreate,
      undefined,
      selectedColumns,
    );
    const createdRecordsIds = createdRecords.identifiers.map(
      (record) => record.id,
    );

    const records = await this.getRecord({
      recordIds: createdRecordsIds,
      repository,
      objectMetadata,
      depth: parseDepthRestRequest(request),
      restrictedFields,
    });

    if (records.length !== body.length) {
      throw new InternalServerErrorException(
        `Error when creating records. ${body.length - records.length} records are missing after creation.`,
      );
    }

    return this.formatResult({
      operation: 'create',
      objectNamePlural: objectMetadata.objectMetadataMapItem.namePlural,
      data: records,
    });
  }
}
