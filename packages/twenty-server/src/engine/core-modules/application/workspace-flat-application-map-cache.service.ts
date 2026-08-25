import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { fromApplicationEntityToFlatApplication } from 'src/engine/core-modules/application/utils/from-application-entity-to-flat-application.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { type CacheEntityFetchShape } from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';

@Injectable()
@WorkspaceCache('flatApplicationMaps', { packingPonderation: 1 })
export class WorkspaceFlatApplicationMapCacheService extends WorkspaceCacheProvider<FlatApplicationCacheMaps> {
  override readonly fetchRequirements = {
    application: true,
  } as const satisfies CacheEntityFetchShape;

  computeForCache(
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatApplicationCacheMaps {
    const { application: applicationEntities } = recomputeContext.getRowsByName(
      this.fetchRequirements,
    );

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
