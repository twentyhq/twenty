import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/core-modules/common/constant/empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { ViewFieldEntity } from 'src/engine/core-modules/view-field/entities/view-field.entity';
import { FlatViewFieldMaps } from 'src/engine/core-modules/view-field/flat-view-field/types/flat-view-field-maps.type';
import { fromViewFieldEntityToFlatViewField } from 'src/engine/core-modules/view-field/flat-view-field/utils/from-view-field-entity-to-flat-view-field.util';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';

@Injectable()
@WorkspaceFlatMapCache('flatViewFieldMaps')
export class WorkspaceFlatViewFieldMapCacheService extends WorkspaceFlatMapCacheService<FlatViewFieldMaps> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    @InjectRepository(ViewFieldEntity)
    private readonly viewFieldRepository: Repository<ViewFieldEntity>,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatViewFieldMaps> {
    const existingViewFields = await this.viewFieldRepository.find({
      where: {
        workspaceId,
      },
      withDeleted: true,
    });

    return existingViewFields.reduce((flatViewFieldMaps, viewFieldEntity) => {
      const flatViewField = fromViewFieldEntityToFlatViewField(viewFieldEntity);

      return addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: flatViewField,
        flatEntityMaps: flatViewFieldMaps,
      });
    }, EMPTY_FLAT_ENTITY_MAPS);
  }
}
