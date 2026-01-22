import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { type ApplicationVariableCacheMaps } from 'src/engine/core-modules/applicationVariable/types/application-variable-cache-maps.type';
import { fromApplicationVariableEntityToFlatApplicationVariable } from 'src/engine/core-modules/applicationVariable/utils/from-application-variable-entity-to-flat-application-variable.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

@Injectable()
@WorkspaceCache('applicationVariableMaps')
export class WorkspaceApplicationVariableMapCacheService extends WorkspaceCacheProvider<ApplicationVariableCacheMaps> {
  constructor(
    @InjectRepository(ApplicationVariableEntity)
    private readonly applicationVariableRepository: Repository<ApplicationVariableEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<ApplicationVariableCacheMaps> {
    const applicationVariableEntities = await this.applicationVariableRepository
      .createQueryBuilder('applicationVariable')
      .innerJoin('applicationVariable.application', 'application')
      .where('application.workspaceId = :workspaceId', { workspaceId })
      .getMany();

    const applicationVariableMaps: ApplicationVariableCacheMaps = {
      byId: {},
      byApplicationId: {},
    };

    for (const entity of applicationVariableEntities) {
      const flatApplicationVariable =
        fromApplicationVariableEntityToFlatApplicationVariable(entity);

      applicationVariableMaps.byId[flatApplicationVariable.id] =
        flatApplicationVariable;

      if (!isDefined(flatApplicationVariable.applicationId)) {
        continue;
      }
      if (
        !isDefined(
          applicationVariableMaps.byApplicationId[
            flatApplicationVariable.applicationId
          ],
        )
      ) {
        applicationVariableMaps.byApplicationId[
          flatApplicationVariable.applicationId
        ] = [flatApplicationVariable];
        continue;
      }

      applicationVariableMaps.byApplicationId[
        flatApplicationVariable.applicationId
      ]?.push(flatApplicationVariable);
    }

    return applicationVariableMaps;
  }
}
