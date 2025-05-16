import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

@Injectable()
export class RestApiCreateManyHandler extends RestApiBaseHandler {
  async handle(request: Request) {
    const { objectMetadataNamePlural, objectMetadata, repository } =
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

    const createdRecords = await repository.save(overriddenRecordsToCreate);

    this.apiEventEmitterService.emitCreateEvents(
      createdRecords,
      this.getAuthContextFromRequest(request),
      objectMetadata.objectMetadataMapItem,
    );

    const records = await this.getRecord({
      recordIds: createdRecords.map((record) => record.id),
      repository,
      objectMetadata,
      depth: this.depthInputFactory.create(request),
    });

    if (records.length !== body.length) {
      throw new Error(
        `Error when creating records. ${body.length - records.length} records are missing after creation.`,
      );
    }

    return this.formatResult({
      operation: 'create',
      objectNamePlural: objectMetadataNamePlural,
      data: records,
    });
  }
}
