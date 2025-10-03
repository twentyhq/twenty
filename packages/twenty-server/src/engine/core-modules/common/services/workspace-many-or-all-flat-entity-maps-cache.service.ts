import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ALL_FLAT_ENTITY_MAPS_PROPERTIES } from 'src/engine/core-modules/common/constant/all-flat-entity-maps-properties.constant';
import { AllFlatEntities } from 'src/engine/core-modules/common/types/all-flat-entities.type';
import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { WorkspaceFlatMapCacheRegistryService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache-registry.service';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';

@Injectable()
export class WorkspaceManyOrAllFlatEntityMapsCacheService {
  private readonly logger = new Logger(
    WorkspaceManyOrAllFlatEntityMapsCacheService.name,
  );

  constructor(
    private readonly cacheRegistry: WorkspaceFlatMapCacheRegistryService,
  ) {}

  private async executeActionForManyOrAllFlatEntity<
    T extends (keyof AllFlatEntityMaps)[] = (keyof AllFlatEntityMaps)[],
  >({
    action,
    flatMapsKeys,
  }: {
    flatMapsKeys: T | undefined;
    action: (args: {
      service: WorkspaceFlatMapCacheService<FlatEntityMaps<AllFlatEntities>>;
      flatEntityName: T[number];
    }) => Promise<void>;
  }): Promise<void> {
    for (const flatEntityName of ALL_FLAT_ENTITY_MAPS_PROPERTIES) {
      if (isDefined(flatMapsKeys) && !flatMapsKeys.includes(flatEntityName)) {
        continue;
      }

      try {
        const service =
          this.cacheRegistry.getCacheServiceOrThrow(flatEntityName);

        await action({ flatEntityName, service });
      } catch (error) {
        this.logger.error(
          `Failed to run action on flat entity maps of ${flatEntityName}`,
          error,
        );
        throw error;
      }
    }
  }

  public async getOrRecomputeManyOrAllFlatEntityMaps<
    T extends (keyof AllFlatEntityMaps)[] = (keyof AllFlatEntityMaps)[],
  >({
    flatMapsKeys,
    workspaceId,
  }: {
    workspaceId: string;
    flatMapsKeys?: T;
  }): Promise<Pick<AllFlatEntityMaps, T[number]>> {
    let pickedFlatEntityMaps = {} as Pick<AllFlatEntityMaps, T[number]>;

    await this.executeActionForManyOrAllFlatEntity({
      action: async ({ service, flatEntityName }) => {
        const cacheResult = (await service.getExistingOrRecomputeFlatMaps({
          workspaceId,
        })) as AllFlatEntityMaps[T[number]];

        pickedFlatEntityMaps[flatEntityName] = cacheResult;
      },
      flatMapsKeys,
    });

    return pickedFlatEntityMaps;
  }

  public async invalidateFlatEntityMaps<
    T extends (keyof AllFlatEntityMaps)[] = (keyof AllFlatEntityMaps)[],
  >({
    flatMapsKeys,
    workspaceId,
  }: {
    workspaceId: string;
    flatMapsKeys?: T;
  }): Promise<void> {
    await this.executeActionForManyOrAllFlatEntity({
      action: async ({ service }) =>
        await service.invalidateCache({ workspaceId }),
      flatMapsKeys,
    });
  }

  public async flushFlatEntityMaps<
    T extends (keyof AllFlatEntityMaps)[] = (keyof AllFlatEntityMaps)[],
  >({
    flatMapsKeys,
    workspaceId,
  }: {
    workspaceId: string;
    flatMapsKeys?: T;
  }): Promise<void> {
    await this.executeActionForManyOrAllFlatEntity({
      action: async ({ service }) => await service.flushCache({ workspaceId }),
      flatMapsKeys,
    });
  }
}
