import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { getObjectMetadataFromObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/utils/get-object-metadata-from-object-metadata-Item-with-field-maps';

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

    this.apiEventEmitterService.emitDestroyEvents({
      records: [recordToDelete],
      authContext: this.getAuthContextFromRequest(request),
      objectMetadataItem: getObjectMetadataFromObjectMetadataItemWithFieldMaps(
        objectMetadata.objectMetadataMapItem,
      ),
    });

    return this.formatResult({
      operation: 'delete',
      objectNameSingular: objectMetadata.objectMetadataMapItem.nameSingular,
      data: {
        id: recordToDelete.id,
      },
    });
  }
}
