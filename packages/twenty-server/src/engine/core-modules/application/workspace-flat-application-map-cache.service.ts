import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { isApplicationExemptFromGrant } from 'src/engine/core-modules/application/application-grant/utils/is-application-exempt-from-grant.util';
import { FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { fromApplicationEntityToFlatApplication } from 'src/engine/core-modules/application/utils/from-application-entity-to-flat-application.util';
import { isOAuthOnlyApplication } from 'src/engine/core-modules/application/utils/is-oauth-only-application.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

const FLAT_APPLICATION_ROWS_REQUIREMENT = {
  application: true,
  roleTarget: ['roleId', 'targetApplicationId'],
} as const satisfies WorkspaceCacheRowsRequirement;

@Injectable()
@WorkspaceCache('flatApplicationMaps', { packingPonderation: 1 })
export class WorkspaceFlatApplicationMapCacheService extends WorkspaceCacheProvider<FlatApplicationCacheMaps> {
  override readonly rowsRequirement = FLAT_APPLICATION_ROWS_REQUIREMENT;

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {
    super();
  }

  async computeForCache({
    workspaceId,
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_APPLICATION_ROWS_REQUIREMENT
  >): Promise<FlatApplicationCacheMaps> {
    const { application: applicationEntities, roleTarget: roleTargets } = rows;

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: ['id', 'workspaceCustomApplicationId'],
    });

    const grantRoleIdByApplicationId = new Map(
      roleTargets.flatMap((roleTarget) =>
        isDefined(roleTarget.targetApplicationId)
          ? [[roleTarget.targetApplicationId, roleTarget.roleId]]
          : [],
      ),
    );

    const flatApplicationMaps: FlatApplicationCacheMaps = {
      byId: {},
      idByUniversalIdentifier: {},
    };

    for (const applicationEntity of applicationEntities) {
      const flatApplication =
        fromApplicationEntityToFlatApplication(applicationEntity);

      flatApplication.isGrantExempt = isApplicationExemptFromGrant({
        application: flatApplication,
        workspaceCustomApplicationId: workspace?.workspaceCustomApplicationId,
      });
      flatApplication.runtimeRoleId = isOAuthOnlyApplication(flatApplication)
        ? null
        : flatApplication.isGrantExempt
          ? flatApplication.defaultRoleId
          : (grantRoleIdByApplicationId.get(flatApplication.id) ?? null);

      flatApplicationMaps.byId[flatApplication.id] = flatApplication;
      flatApplicationMaps.idByUniversalIdentifier[
        flatApplication.universalIdentifier
      ] = flatApplication.id;
    }

    return flatApplicationMaps;
  }
}
