import { Injectable, Logger } from '@nestjs/common';

import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { ALL_FLAT_ENTITY_MAPS_PROPERTIES } from 'src/engine/core-modules/common/constant/all-flat-entity-maps-properties.constant';
import { EMPTY_ALL_FLAT_ENTITY_MAPS } from 'src/engine/core-modules/common/constant/empty-all-flat-entity-maps.constant';
import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { ViewCacheService } from 'src/engine/core-modules/view/cache/services/view-cache.service';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';

@Injectable()
export class FlatEntityMapsCacheService {
  logger = new Logger(FlatEntityMapsCacheService.name);

  constructor(
    private viewCacheService: ViewCacheService,
    private workspaceMetadataCacheService: WorkspaceMetadataCacheService,
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

      switch (flatEntityName) {
        case 'flatObjectMetadataMaps': {
          const { flatObjectMetadataMaps } =
            await this.workspaceMetadataCacheService.getExistingOrRecomputeFlatObjectMetadataMaps(
              { workspaceId },
            );

          allFlatEntityMaps.flatObjectMetadataMaps = flatObjectMetadataMaps;
          break;
        }
        case 'flatViewMaps': {
          const { flatViewMaps } =
            await this.viewCacheService.getExistingOrRecomputeFlatViewMaps({
              workspaceId,
            });

          allFlatEntityMaps.flatViewMaps = flatViewMaps;
          break;
        }
        case 'flatViewFieldMaps': {
          const { flatViewFieldMaps } =
            await this.viewCacheService.getExistingFlatViewFieldMapsFromCache({
              workspaceId,
            });

          allFlatEntityMaps.flatViewFieldMaps = flatViewFieldMaps;
          break;
        }
        default: {
          assertUnreachable(flatEntityName);
        }
      }
    }

    return allFlatEntityMaps;
  }
}
