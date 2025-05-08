import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { RestApiBaseResolverService } from 'src/engine/api/rest/core/interfaces/rest-api-base-resolver.service';

import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';

@Injectable()
export class RestApiUpdateOneResolverService extends RestApiBaseResolverService {
  async resolve(request: Request) {
    const { id: recordId } = parseCorePath(request);

    if (!recordId) {
      throw new BadRequestException('Record ID not found');
    }

    const { objectMetadataNameSingular, objectMetadata, repository } =
      await this.getRepositoryAndMetadataOrFail(request);

    const recordToUpdate = await repository.findOneOrFail({
      where: { id: recordId },
    });

    const overriddenBody = await this.recordInputTransformerService.process({
      recordInput: request.body,
      objectMetadataMapItem: objectMetadata.objectMetadataMapItem,
    });

    const updatedRecord = await repository.save({
      ...recordToUpdate,
      ...overriddenBody,
    });

    this.apiEventEmitterService.emitUpdateEvents(
      [recordToUpdate],
      [updatedRecord],
      Object.keys(request.body),
      this.getAuthContextFromRequest(request),
      objectMetadata.objectMetadataMapItem,
    );

    const records = await this.getRecord({
      recordIds: [updatedRecord.id],
      repository,
      objectMetadata,
      depth: this.depthInputFactory.create(request),
    });

    const record = records[0];

    if (!isDefined(record)) {
      throw new Error('Updated record not found');
    }

    return this.formatResult({
      operation: 'update',
      objectNameSingular: objectMetadataNameSingular,
      data: record,
    });
  }
}
