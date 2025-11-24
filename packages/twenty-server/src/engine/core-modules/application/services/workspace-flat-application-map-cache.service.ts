import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { AllMetadataName } from 'twenty-shared/metadata';
import { Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { fromApplicationEntityToFlatApplication } from 'src/engine/core-modules/application/utils/from-application-entity-to-flat-application.util';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';

@Injectable()
@WorkspaceFlatMapCache(
  'flatApplicationMaps' as MetadataToFlatEntityMapsKey<AllMetadataName>,
) // TODO prastoin introduce SyncableMetadata notion
export class WorkspaceFlatApplicationMapCacheService extends WorkspaceFlatMapCacheService<FlatApplicationCacheMaps> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatApplicationCacheMaps> {
    const applicationEntities = await this.applicationRepository.find({
      where: {
        workspaceId,
      },
      withDeleted: true,
    });

    const flatApplicationMaps: FlatApplicationCacheMaps = {
      byId: {},
      idByUniversalIdentifier: {},
    };

    for (const applicationEntity of applicationEntities) {
      const flatApplication =
        fromApplicationEntityToFlatApplication(applicationEntity);

      flatApplicationMaps.byId[flatApplication.id] = flatApplication;
      flatApplicationMaps.idByUniversalIdentifier[
        flatApplication.universalIdentifier
      ] = flatApplication.id;
    }

    return flatApplicationMaps;
  }
}
