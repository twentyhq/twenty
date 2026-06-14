import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { type ApplicationVariableCacheMaps } from 'src/engine/core-modules/application/application-variable/types/application-variable-cache-maps.type';
import { fromApplicationVariableEntityToFlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/utils/from-application-variable-entity-to-flat-application-variable.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('applicationVariableMaps')
export class WorkspaceApplicationVariableMapCacheService extends WorkspaceCacheProvider<ApplicationVariableCacheMaps> {
  constructor(
    @InjectRepository(ApplicationVariableEntity)
    private readonly applicationVariableRepository: Repository<ApplicationVariableEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<ApplicationVariableCacheMaps> {
    const [applicationVariableEntities, applications] = await Promise.all([
      this.applicationVariableRepository.find({
        where: { workspaceId },
      }),
      this.applicationRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
      }),
    ]);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);

    const applicationVariableMaps = createEmptyFlatEntityMaps();

    for (const entity of applicationVariableEntities) {
      const flatApplicationVariable =
        fromApplicationVariableEntityToFlatApplicationVariable({
          entity,
          applicationIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatApplicationVariable,
        flatEntityMapsToMutate: applicationVariableMaps,
      });
    }

    return applicationVariableMaps;
  }
}
