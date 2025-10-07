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
export class RestApiCreateOneHandler extends RestApiBaseHandler {
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
      depth: this.depthInputFactory.create(request),
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
