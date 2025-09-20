import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ALL_FLAT_ENTITY_MAPS_PROPERTIES } from 'src/engine/core-modules/common/constant/all-flat-entity-maps-properties.constant';
import { EMPTY_ALL_FLAT_ENTITY_MAPS } from 'src/engine/core-modules/common/constant/empty-all-flat-entity-maps.constant';
import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import {
  WorkspaceFlatMapCacheException,
  WorkspaceFlatMapCacheExceptionCode,
} from 'src/engine/workspace-flat-map-cache/exceptions/workspace-flat-map-cache.exception';
import { WorkspaceFlatMapCacheRegistryService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache-registry.service';

@Injectable()
export class WorkspaceManyOrAllFlatEntityMapsCacheService {
  private readonly logger = new Logger(
    WorkspaceManyOrAllFlatEntityMapsCacheService.name,
  );

  constructor(
    private readonly cacheRegistry: WorkspaceFlatMapCacheRegistryService,
  ) {}

  public async getOrRecomputeManyOrAllFlatEntityMaps<
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

      try {
        const service = this.cacheRegistry.getCacheService(flatEntityName);

        if (!isDefined(service)) {
          throw new WorkspaceFlatMapCacheException(
            `No cache service found for ${flatEntityName}`,
            WorkspaceFlatMapCacheExceptionCode.INTERNAL_SERVER_ERROR,
          );
        }

        const result = await service.getExistingOrRecomputeFlatMaps({
          workspaceId,
        });

        // @ts-expect-error todo prastoin once refactored flat object metadata cache
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

      try {
        const service = this.cacheRegistry.getCacheService(flatEntityName);

        if (!isDefined(service)) {
          throw new WorkspaceFlatMapCacheException(
            `No cache service found for ${flatEntityName}`,
            WorkspaceFlatMapCacheExceptionCode.INTERNAL_SERVER_ERROR,
          );
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
