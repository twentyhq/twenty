import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FlatFeatureFlag } from 'src/engine/core-modules/feature-flag/types/flat-feature-flag.type';
import { fromFeatureFlagEntityToFlatFeatureFlag } from 'src/engine/core-modules/feature-flag/utils/from-feature-flag-entity-to-flat-feature-flag.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceFlatMapCache('flatFeatureFlagMaps')
export class WorkspaceFlatFeatureFlagMapCacheService extends WorkspaceFlatMapCacheService<
  FlatEntityMaps<FlatFeatureFlag>
> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    @InjectRepository(FeatureFlagEntity)
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatEntityMaps<FlatFeatureFlag>> {
    const featureFlags = await this.featureFlagRepository.find({
      where: {
        workspaceId,
      },
    });

    const flatFeatureFlagMaps = createEmptyFlatEntityMaps();

    for (const featureFlagEntity of featureFlags) {
      const flatFeatureFlag =
        fromFeatureFlagEntityToFlatFeatureFlag(featureFlagEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatFeatureFlag,
        flatEntityMapsToMutate: flatFeatureFlagMaps,
      });
    }

    return flatFeatureFlagMaps;
  }
}
