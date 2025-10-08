import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import isEmpty from 'lodash.isempty';
import { isDefined } from 'twenty-shared/utils';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { getAllSelectableFields } from 'src/engine/api/utils/get-all-selectable-fields.utils';

@Injectable()
export class RestApiCreateManyHandler extends RestApiBaseHandler {
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
      depth: this.depthInputFactory.create(request),
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
