import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import isEmpty from 'lodash.isempty';
import { ObjectRecord } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { CommonUpdateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-one-query-runner.service';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { parseDepthRestRequest } from 'src/engine/api/rest/input-request-parsers/depth-parser-utils/parse-depth-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';
import { getAllSelectableColumnNames } from 'src/engine/api/utils/get-all-selectable-column-names.utils';

@Injectable()
export class RestApiUpdateOneHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonUpdateOneQueryRunnerService: CommonUpdateOneQueryRunnerService,
  ) {
    super();
  }

  async commonHandle(request: AuthenticatedRequest) {
    try {
      const { id, data, depth } = this.parseRequestArgs(request);

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

      const record = await this.commonUpdateOneQueryRunnerService.execute(
        { id, data, selectedFields },
        {
          authContext,
          objectMetadataMaps,
          objectMetadataItemWithFieldMaps,
        },
      );

      return this.formatRestResponse(
        record,
        objectMetadataItemWithFieldMaps.nameSingular,
      );
    } catch (error) {
      workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  private formatRestResponse(record: ObjectRecord, objectNameSingular: string) {
    return { data: { [`update${capitalize(objectNameSingular)}`]: record } };
  }

  private parseRequestArgs(request: AuthenticatedRequest) {
    const { id } = parseCorePath(request);

    if (!id) {
      throw new BadRequestException('Record ID not found');
    }

    return {
      id,
      data: request.body,
      depth: parseDepthRestRequest(request),
    };
  }

  async handle(request: AuthenticatedRequest) {
    const { id: recordId } = parseCorePath(request);

    if (!recordId) {
      throw new BadRequestException('Record ID not found');
    }

    const { objectMetadata, repository, restrictedFields } =
      await this.getRepositoryAndMetadataOrFail(request);

    // assert the record exists
    await repository.findOneOrFail({
      select: { id: true },
      where: { id: recordId },
    });

    const overriddenBody = await this.recordInputTransformerService.process({
      recordInput: request.body,
      objectMetadataMapItem: objectMetadata.objectMetadataMapItem,
    });

    let selectedColumns = undefined;

    if (!isEmpty(restrictedFields)) {
      const selectableFields = getAllSelectableColumnNames({
        restrictedFields,
        objectMetadata,
      });

      selectedColumns = Object.keys(selectableFields).filter(
        (key) => selectableFields[key],
      );
    }

    const updatedRecord = await repository.update(
      recordId,
      overriddenBody,
      undefined,
      selectedColumns,
    );

    const updatedRecordId = updatedRecord.generatedMaps[0].id;

    const records = await this.getRecord({
      recordIds: [updatedRecordId],
      repository,
      objectMetadata,
      depth: parseDepthRestRequest(request),
      restrictedFields,
    });

    const record = records[0];

    if (!isDefined(record)) {
      throw new InternalServerErrorException('Updated record not found');
    }

    return this.formatResult({
      operation: 'update',
      objectNameSingular: objectMetadata.objectMetadataMapItem.nameSingular,
      data: record,
    });
  }
}
