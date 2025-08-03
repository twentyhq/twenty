import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';

@Injectable()
export class RestApiUpdateOneHandler extends RestApiBaseHandler {
  async handle(request: Request) {
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

    const updatedRecord = await repository.save({
      id: recordId,
      ...overriddenBody,
    });

    const records = await this.getRecord({
      recordIds: [updatedRecord.id],
      repository,
      objectMetadata,
      depth: this.depthInputFactory.create(request),
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
