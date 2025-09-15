import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ALL_FLAT_ENTITY_MAPS_PROPERTIES } from 'src/engine/core-modules/common/constant/all-flat-entity-maps-properties.constant';
import { EMPTY_ALL_FLAT_ENTITY_MAPS } from 'src/engine/core-modules/common/constant/empty-all-flat-entity-maps.constant';
import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspaceFlatMapCacheRegistryService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache-registry.service';

@Injectable()
export class FlatEntityMapsCacheService {
  private readonly logger = new Logger(FlatEntityMapsCacheService.name);

  constructor(
    private readonly cacheRegistry: WorkspaceFlatMapCacheRegistryService,
    private workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {}

  public async getOrRecomputeAllFlatEntityMaps<
    T extends (keyof AllFlatEntityMaps)[] = (keyof AllFlatEntityMaps)[],
  >({
    flatEntities,
    workspaceId,
  }: {
    workspaceId: string;
    flatEntities?: T;
  }): Promise<Pick<AllFlatEntityMaps, T[number]>> {
    const allFlatEntityMaps: AllFlatEntityMaps = structuredClone(
      EMPTY_ALL_FLAT_ENTITY_MAPS,
    );

    for (const flatEntityName of ALL_FLAT_ENTITY_MAPS_PROPERTIES) {
      if (isDefined(flatEntities) && !flatEntities.includes(flatEntityName)) {
        delete allFlatEntityMaps[flatEntityName];
        continue;
      }

      if (flatEntityName === 'flatObjectMetadataMaps') {
        const { flatObjectMetadataMaps } =
          await this.workspaceMetadataCacheService.getExistingOrRecomputeFlatObjectMetadataMaps(
            {
              workspaceId,
            },
          );
        allFlatEntityMaps.flatObjectMetadataMaps = flatObjectMetadataMaps;
        continue;
      }

      try {
        const service = this.cacheRegistry.getCacheService(flatEntityName);

        if (!isDefined(service)) {
          throw new Error(`No cache service found for ${flatEntityName}`);
        }

        const result = await service.getExistingOrRecomputeFlatMaps({
          workspaceId,
        });

        allFlatEntityMaps[flatEntityName] = result;
      } catch (error) {
        this.logger.error(
          `Failed to get flat entity maps for ${flatEntityName}`,
          error,
        );
        throw error;
      }
    }

    return allFlatEntityMaps;
  }

  public async invalidateFlatEntityMaps<
    T extends (keyof AllFlatEntityMaps)[] = (keyof AllFlatEntityMaps)[],
  >({
    flatEntities,
    workspaceId,
  }: {
    workspaceId: string;
    flatEntities?: T;
  }): Promise<void> {
    for (const flatEntityName of ALL_FLAT_ENTITY_MAPS_PROPERTIES) {
      if (isDefined(flatEntities) && !flatEntities.includes(flatEntityName)) {
        continue;
      }

      if (flatEntityName === 'flatObjectMetadataMaps') {
        await this.workspaceMetadataVersionService.incrementMetadataVersion(
          workspaceId,
        );
        continue;
      }

      try {
        const service = this.cacheRegistry.getCacheService(flatEntityName);

        if (!service) {
          throw new Error(`No cache service found for ${flatEntityName}`);
        }

        await service.invalidateCache({ workspaceId });
      } catch (error) {
        this.logger.error(
          `Failed to invalidate flat entity maps for ${flatEntityName}`,
          error,
        );
        throw error;
      }
    }
  }
}
