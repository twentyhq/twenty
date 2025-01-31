import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';
import { capitalize } from 'twenty-shared';

import { CoreQueryBuilderFactory } from 'src/engine/api/rest/core/query-builder/core-query-builder.factory';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export class RestApiCoreServiceV2 {
  constructor(
    private readonly coreQueryBuilderFactory: CoreQueryBuilderFactory,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async delete(request: Request) {
    const { workspace } = request;
    const { object: parsedObject, id: recordId } = parseCorePath(request);

    const objectMetadata = await this.coreQueryBuilderFactory.getObjectMetadata(
      request,
      parsedObject,
    );

    if (!objectMetadata) {
      throw new BadRequestException('Object metadata not found');
    }

    if (!recordId) {
      throw new BadRequestException('Record ID not found');
    }

    const objectMetadataNameSingular =
      objectMetadata.objectMetadataItem.nameSingular;

    if (!workspace?.id) {
      throw new BadRequestException('Workspace not found');
    }

    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspace.id,
        objectMetadataNameSingular,
      );

    const recordToDelete = await repository.findOneOrFail({
      where: {
        id: recordId,
      },
    });

    await repository.delete(recordId);

    return this.formatResult('delete', objectMetadataNameSingular, {
      id: recordToDelete.id,
    });
  }

  private formatResult<T>(
    operation: 'delete' | 'create' | 'update' | 'find',
    objectNameSingular: string,
    data: T,
  ) {
    const result = {
      data: {
        [operation + capitalize(objectNameSingular)]: data,
      },
    };

    return result;
  }
}
