import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';

import { CreateManyQueryFactory } from 'src/engine/api/rest/core/query-builder/factories/create-many-query.factory';
import { CreateOneQueryFactory } from 'src/engine/api/rest/core/query-builder/factories/create-one-query.factory';
import { CreateVariablesFactory } from 'src/engine/api/rest/core/query-builder/factories/create-variables.factory';
import { DeleteQueryFactory } from 'src/engine/api/rest/core/query-builder/factories/delete-query.factory';
import { DeleteVariablesFactory } from 'src/engine/api/rest/core/query-builder/factories/delete-variables.factory';
import { FindDuplicatesQueryFactory } from 'src/engine/api/rest/core/query-builder/factories/find-duplicates-query.factory';
import { FindDuplicatesVariablesFactory } from 'src/engine/api/rest/core/query-builder/factories/find-duplicates-variables.factory';
import { FindManyQueryFactory } from 'src/engine/api/rest/core/query-builder/factories/find-many-query.factory';
import { FindOneQueryFactory } from 'src/engine/api/rest/core/query-builder/factories/find-one-query.factory';
import { GetVariablesFactory } from 'src/engine/api/rest/core/query-builder/factories/get-variables.factory';
import { UpdateQueryFactory } from 'src/engine/api/rest/core/query-builder/factories/update-query.factory';
import { UpdateVariablesFactory } from 'src/engine/api/rest/core/query-builder/factories/update-variables.factory';
import { computeDepth } from 'src/engine/api/rest/core/query-builder/utils/compute-depth.utils';
import { parseCoreBatchPath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-batch-path.utils';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { Query } from 'src/engine/api/rest/core/types/query.type';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataMapItemByNamePlural } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-plural.util';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class CoreQueryBuilderFactory {
  constructor(
    private readonly deleteQueryFactory: DeleteQueryFactory,
    private readonly createOneQueryFactory: CreateOneQueryFactory,
    private readonly createManyQueryFactory: CreateManyQueryFactory,
    private readonly updateQueryFactory: UpdateQueryFactory,
    private readonly findOneQueryFactory: FindOneQueryFactory,
    private readonly findManyQueryFactory: FindManyQueryFactory,
    private readonly findDuplicatesQueryFactory: FindDuplicatesQueryFactory,
    private readonly deleteVariablesFactory: DeleteVariablesFactory,
    private readonly createVariablesFactory: CreateVariablesFactory,
    private readonly updateVariablesFactory: UpdateVariablesFactory,
    private readonly getVariablesFactory: GetVariablesFactory,
    private readonly findDuplicatesVariablesFactory: FindDuplicatesVariablesFactory,
    private readonly accessTokenService: AccessTokenService,
    private readonly domainManagerService: DomainManagerService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
  ) {}

  async getObjectMetadata(
    request: Request,
    parsedObject: string,
  ): Promise<{
    objectMetadataMaps: ObjectMetadataMaps;
    objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
  }> {
    const { workspace } =
      await this.accessTokenService.validateTokenByRequest(request);

    const currentCacheVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspace.id);

    if (currentCacheVersion === undefined) {
      await this.workspaceMetadataCacheService.recomputeMetadataCache({
        workspaceId: workspace.id,
      });

      throw new BadRequestException('Metadata cache version not found');
    }
    const objectMetadataMaps =
      await this.workspaceCacheStorageService.getObjectMetadataMaps(
        workspace.id,
        currentCacheVersion,
      );

    if (!objectMetadataMaps) {
      throw new BadRequestException(
        `No object was found for the workspace associated with this API key. You may generate a new one here ${this.domainManagerService
          .buildWorkspaceURL({
            workspace,
            pathname: '/settings/developers',
          })
          .toString()}`,
      );
    }

    const objectMetadataItem = getObjectMetadataMapItemByNamePlural(
      objectMetadataMaps,
      parsedObject,
    );

    if (!objectMetadataItem) {
      const wrongObjectMetadataItem = getObjectMetadataMapItemByNameSingular(
        objectMetadataMaps,
        parsedObject,
      );

      let hint = 'eg: companies';

      if (wrongObjectMetadataItem) {
        hint = `Did you mean '${wrongObjectMetadataItem.namePlural}'?`;
      }

      throw new BadRequestException(
        `object '${parsedObject}' not found. ${hint}`,
      );
    }

    return {
      objectMetadataMaps,
      objectMetadataMapItem: objectMetadataItem,
    };
  }

  async delete(request: Request): Promise<Query> {
    const { object: parsedObject } = parseCorePath(request);
    const objectMetadata = await this.getObjectMetadata(request, parsedObject);

    const { id } = parseCorePath(request);

    if (!id) {
      throw new BadRequestException(
        `delete ${objectMetadata.objectMetadataMapItem.nameSingular} query invalid. Id missing. eg: /rest/${objectMetadata.objectMetadataMapItem.namePlural}/0d4389ef-ea9c-4ae8-ada1-1cddc440fb56`,
      );
    }

    return {
      query: this.deleteQueryFactory.create(
        objectMetadata.objectMetadataMapItem,
      ),
      variables: this.deleteVariablesFactory.create(id),
    };
  }

  async createOne(request: Request): Promise<Query> {
    const { object: parsedObject } = parseCorePath(request);
    const objectMetadata = await this.getObjectMetadata(request, parsedObject);

    const depth = computeDepth(request);

    return {
      query: this.createOneQueryFactory.create(objectMetadata, depth),
      variables: this.createVariablesFactory.create(request),
    };
  }

  async createMany(request: Request): Promise<Query> {
    const { object: parsedObject } = parseCoreBatchPath(request);
    const objectMetadata = await this.getObjectMetadata(request, parsedObject);
    const depth = computeDepth(request);

    return {
      query: this.createManyQueryFactory.create(objectMetadata, depth),
      variables: this.createVariablesFactory.create(request),
    };
  }

  async update(request: Request): Promise<Query> {
    const { object: parsedObject } = parseCorePath(request);
    const objectMetadata = await this.getObjectMetadata(request, parsedObject);

    const depth = computeDepth(request);

    const { id } = parseCorePath(request);

    if (!id) {
      throw new BadRequestException(
        `update ${objectMetadata.objectMetadataMapItem.nameSingular} query invalid. Id missing. eg: /rest/${objectMetadata.objectMetadataMapItem.namePlural}/0d4389ef-ea9c-4ae8-ada1-1cddc440fb56`,
      );
    }

    return {
      query: this.updateQueryFactory.create(objectMetadata, depth),
      variables: this.updateVariablesFactory.create(id, request),
    };
  }

  async get(request: Request): Promise<Query> {
    const { object: parsedObject } = parseCorePath(request);
    const objectMetadata = await this.getObjectMetadata(request, parsedObject);

    const depth = computeDepth(request);

    const { id } = parseCorePath(request);

    return {
      query: id
        ? this.findOneQueryFactory.create(objectMetadata, depth)
        : this.findManyQueryFactory.create(objectMetadata, depth),
      variables: this.getVariablesFactory.create(id, request, objectMetadata),
    };
  }

  async findDuplicates(request: Request): Promise<Query> {
    const { object: parsedObject } = parseCorePath(request);
    const objectMetadata = await this.getObjectMetadata(request, parsedObject);
    const depth = computeDepth(request);

    return {
      query: this.findDuplicatesQueryFactory.create(objectMetadata, depth),
      variables: this.findDuplicatesVariablesFactory.create(request),
    };
  }
}
