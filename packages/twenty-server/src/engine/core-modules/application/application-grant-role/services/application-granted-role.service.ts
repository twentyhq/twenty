import { Injectable } from '@nestjs/common';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { resolveApplicationGrantedRoleId } from 'src/engine/core-modules/application/application-grant-role/utils/resolve-application-granted-role-id.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ApplicationGrantedRoleService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  async findGrantedRoleId({
    workspaceId,
    flatApplication,
  }: {
    workspaceId: string;
    flatApplication: Pick<
      FlatApplication,
      'id' | 'defaultRoleId' | 'sourceType'
    >;
  }): Promise<string | undefined> {
    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      workspaceId,
    );
    const { flatRoleTargetByApplicationIdMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRoleTargetByApplicationIdMaps',
      ]);

    return resolveApplicationGrantedRoleId({
      flatApplication,
      workspaceId,
      workspaceCustomApplicationId: workspace?.workspaceCustomApplicationId,
      flatRoleTargetByApplicationIdMaps,
    });
  }
}
