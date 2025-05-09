import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';

import { RestApiBaseResolverService } from 'src/engine/api/rest/core/interfaces/rest-api-base-resolver.service';

import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';

@Injectable()
export class RestApiDeleteOneResolverService extends RestApiBaseResolverService {
  async resolve(request: Request) {
    const { id: recordId } = parseCorePath(request);

    if (!recordId) {
      throw new BadRequestException('Record ID not found');
    }

    const { objectMetadataNameSingular, objectMetadata, repository } =
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
      objectNameSingular: objectMetadataNameSingular,
      data: {
        id: recordToDelete.id,
      },
    });
  }
}
