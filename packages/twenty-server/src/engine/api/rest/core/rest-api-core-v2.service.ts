import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';
import { capitalize } from 'twenty-shared';

import { CoreQueryBuilderFactory } from 'src/engine/api/rest/core/query-builder/core-query-builder.factory';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { extractObjectIdFromPath } from 'src/engine/api/rest/core/utils/extract-id-from-path.utils';
import { RestApiService } from 'src/engine/api/rest/rest-api.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export class RestApiCoreServiceV2 {
  constructor(
    private readonly coreQueryBuilderFactory: CoreQueryBuilderFactory,
    private readonly restApiService: RestApiService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async delete(request: Request) {
    const { workspace } = request;
    const { object: parsedObject } = parseCorePath(request);
    const objectId = extractObjectIdFromPath(request.path);

    const objectMetadata = await this.coreQueryBuilderFactory.getObjectMetadata(
      request,
      parsedObject,
    );

    if (!objectMetadata) {
      throw new BadRequestException('Object not found');
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

    const itemToDelete = await repository.findOne({
      where: {
        id: objectId,
      },
    });

    if (!itemToDelete) {
      throw new BadRequestException('Object to delete not found');
    }

    await repository.delete(objectId);

    return {
      data: {
        [`delete${capitalize(objectMetadataNameSingular)}`]: itemToDelete,
      },
    };
  }
}
