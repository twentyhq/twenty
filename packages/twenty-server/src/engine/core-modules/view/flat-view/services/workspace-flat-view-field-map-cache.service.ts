import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { FlatViewFieldMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-field-maps.type';
import { fromViewFieldEntityToFlatViewField } from 'src/engine/core-modules/view/flat-view/utils/from-view-field-entity-to-flat-view-field.util';
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

    const flatViewFieldMaps: FlatViewFieldMaps = {
      byId: {},
      idByUniversalIdentifier: {},
    };

    for (const viewFieldEntity of existingViewFields) {
      const flatViewField = fromViewFieldEntityToFlatViewField(viewFieldEntity);

      flatViewFieldMaps.byId[flatViewField.id] = flatViewField;
      flatViewFieldMaps.idByUniversalIdentifier[
        flatViewField.universalIdentifier
      ] = flatViewField.id;
    }

    return flatViewFieldMaps;
  }
}
