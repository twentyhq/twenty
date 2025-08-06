import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { getAllSelectableFields } from 'src/engine/api/utils/get-all-selectable-fields.utils';

@Injectable()
export class RestApiDeleteOneHandler extends RestApiBaseHandler {
  async handle(request: Request) {
    const { id: recordId } = parseCorePath(request);

    if (!recordId) {
      throw new BadRequestException('Record ID not found');
    }

    const { objectMetadata, repository, restrictedFields } =
      await this.getRepositoryAndMetadataOrFail(request);

    const selectOptions = getAllSelectableFields({
      restrictedFields,
      objectMetadata,
    });

    const recordToDelete = await repository.findOneOrFail({
      where: { id: recordId },
      select: selectOptions,
    });

    await repository.delete(recordId);

    return this.formatResult({
      operation: 'delete',
      objectNameSingular: objectMetadata.objectMetadataMapItem.nameSingular,
      data: {
        id: recordToDelete.id,
      },
    });
  }
}
