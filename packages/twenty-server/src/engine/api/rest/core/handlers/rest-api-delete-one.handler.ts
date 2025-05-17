import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';

@Injectable()
export class RestApiDeleteOneHandler extends RestApiBaseHandler {
  async handle(request: Request) {
    const { id: recordId } = parseCorePath(request);

    if (!recordId) {
      throw new BadRequestException('Record ID not found');
    }

    const { objectMetadata, repository } =
      await this.getRepositoryAndMetadataOrFail(request);
    const recordToDelete = await repository.findOneOrFail({
      where: { id: recordId },
    });

    await repository.delete(recordId);

    this.apiEventEmitterService.emitDestroyEvents(
      [recordToDelete],
      this.getAuthContextFromRequest(request),
      objectMetadata.objectMetadataMapItem,
    );

    return this.formatResult({
      operation: 'delete',
      objectNameSingular: objectMetadata.objectMetadataMapItem.nameSingular,
      data: {
        id: recordToDelete.id,
      },
    });
  }
}
