import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { type ApplicationVariableCacheMaps } from 'src/engine/core-modules/application/application-variable/types/application-variable-cache-maps.type';
import { fromApplicationVariableEntityToFlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/utils/from-application-variable-entity-to-flat-application-variable.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const APPLICATION_VARIABLE_ROWS_REQUIREMENT = {
  applicationVariable: true,
  application: ['id', 'universalIdentifier', 'deletedAt'],
} as const satisfies WorkspaceCacheRowsRequirement;

@Injectable()
@WorkspaceCache('applicationVariableMaps', { packingPonderation: 1 })
export class WorkspaceApplicationVariableMapCacheService extends WorkspaceCacheProvider<ApplicationVariableCacheMaps> {
  override readonly rowsRequirement = APPLICATION_VARIABLE_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof APPLICATION_VARIABLE_ROWS_REQUIREMENT
  >): ApplicationVariableCacheMaps {
    const {
      applicationVariable: applicationVariableEntities,
      application: applications,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(
        applications.filter((application) => !isDefined(application.deletedAt)),
      );

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
