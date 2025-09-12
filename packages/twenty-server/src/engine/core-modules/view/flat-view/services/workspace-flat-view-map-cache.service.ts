import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { type FlatViewMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-maps.type';
import { generateFlatViewMaps } from 'src/engine/core-modules/view/flat-view/utils/generate-flat-view-maps.util';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';

@Injectable()
@WorkspaceFlatMapCache('view')
export class WorkspaceFlatViewMapCacheService extends WorkspaceFlatMapCacheService<FlatViewMaps> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatViewMaps> {
    const views = await this.viewRepository.find({
      where: {
        workspaceId,
      },
      relations: ['viewFields'],
      select: {
        viewFields: {
          id: true,
        },
      },
    });

    return generateFlatViewMaps(views);
  }
}
