import { BadRequestException, Injectable } from '@nestjs/common';

import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { getAllSelectableFields } from 'src/engine/api/utils/get-all-selectable-fields.utils';

@Injectable()
export class RestApiDeleteOneHandler extends RestApiBaseHandler {
  async handle(request: AuthenticatedRequest) {
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

    const columnsToReturnForDelete: string[] = [];

    await repository.delete(recordId, undefined, columnsToReturnForDelete);

    return this.formatResult({
      operation: 'delete',
      objectNameSingular: objectMetadata.objectMetadataMapItem.nameSingular,
      data: {
        id: recordToDelete.id,
      },
    });
  }
}
