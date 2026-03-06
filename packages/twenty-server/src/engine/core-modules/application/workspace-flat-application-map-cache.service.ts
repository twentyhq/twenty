import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { fromApplicationEntityToFlatApplication } from 'src/engine/core-modules/application/utils/from-application-entity-to-flat-application.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

@Injectable()
@WorkspaceCache('flatApplicationMaps')
export class WorkspaceFlatApplicationMapCacheService extends WorkspaceCacheProvider<FlatApplicationCacheMaps> {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatApplicationCacheMaps> {
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
