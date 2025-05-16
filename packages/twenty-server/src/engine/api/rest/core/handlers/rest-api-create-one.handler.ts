import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

@Injectable()
export class RestApiCreateOneHandler extends RestApiBaseHandler {
  async handle(request: Request) {
    const { objectMetadataNameSingular, objectMetadata, repository } =
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

    await this.createdByFromAuthContextService.injectCreatedBy(
      overriddenBody,
      objectMetadataNameSingular,
      this.getAuthContextFromRequest(request),
    );

    const createdRecord = await repository.save(overriddenBody);

    this.apiEventEmitterService.emitCreateEvents(
      [createdRecord],
      this.getAuthContextFromRequest(request),
      objectMetadata.objectMetadataMapItem,
    );

    const records = await this.getRecord({
      recordIds: [createdRecord.id],
      repository,
      objectMetadata,
      depth: this.depthInputFactory.create(request),
    });

    const record = records[0];

    if (!isDefined(record)) {
      throw new Error('Created record not found');
    }

    return this.formatResult({
      operation: 'create',
      objectNameSingular: objectMetadataNameSingular,
      data: record,
    });
  }
}
