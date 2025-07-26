import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';

import { CreateManyQueryFactory } from 'src/engine/api/rest/core/query-builder/factories/create-many-query.factory';
import { CreateVariablesFactory } from 'src/engine/api/rest/core/query-builder/factories/create-variables.factory';
import { FindDuplicatesQueryFactory } from 'src/engine/api/rest/core/query-builder/factories/find-duplicates-query.factory';
import { FindDuplicatesVariablesFactory } from 'src/engine/api/rest/core/query-builder/factories/find-duplicates-variables.factory';
import { computeDepth } from 'src/engine/api/rest/core/query-builder/utils/compute-depth.utils';
import { parseCoreBatchPath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-batch-path.utils';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { Query } from 'src/engine/api/rest/core/types/query.type';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataMapItemByNamePlural } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-plural.util';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';
import { shouldExcludeFromWorkspaceApi } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/should-exclude-from-workspace-api.util';

@Injectable()
export class CoreQueryBuilderFactory {
  constructor(
    private readonly createManyQueryFactory: CreateManyQueryFactory,
    private readonly createVariablesFactory: CreateVariablesFactory,
    private readonly findDuplicatesQueryFactory: FindDuplicatesQueryFactory,
    private readonly findDuplicatesVariablesFactory: FindDuplicatesVariablesFactory,
    private readonly accessTokenService: AccessTokenService,
    private readonly domainManagerService: DomainManagerService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly featureFlagService: FeatureFlagService,
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

    workspaceValidator.assertIsDefinedOrThrow(workspace);

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
            pathname: '/settings/apis',
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

    const workspaceFeatureFlagsMap =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspace.id);

    // Check if this entity is workspace-gated and should be blocked from workspace API
    if (
      shouldExcludeFromWorkspaceApi(
        objectMetadataItem,
        standardObjectMetadataDefinitions,
        workspaceFeatureFlagsMap,
      )
    ) {
      throw new BadRequestException(
        `object '${parsedObject}' not found. ${parsedObject} is not available via REST API.`,
      );
    }

    return {
      objectMetadataMaps,
      objectMetadataMapItem: objectMetadataItem,
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
