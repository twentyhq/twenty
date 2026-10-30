import { Injectable } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';
import { type SetuAiActionActor } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-actor.type';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Re-resolves the initiating person at execution time. Neither the person
// who proposed nor the one who approved is ever elevated: if they lost AI
// access or their membership, the action is blocked.
@Injectable()
export class SetuAiActionActorService {
  constructor(
    private readonly userWorkspaceAuthContextService: UserWorkspaceAuthContextService,
    private readonly permissionsService: PermissionsService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async resolve({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<SetuAiActionActor | null> {
    try {
      const authContext = await this.userWorkspaceAuthContextService.resolve({
        workspaceId,
        userWorkspaceId,
      });

      const hasAiPermission =
        await this.permissionsService.userHasWorkspaceSettingPermission({
          workspaceId,
          userWorkspaceId,
          setting: PermissionFlagType.AI,
          applicationId: undefined,
        });

      if (!hasAiPermission) {
        return null;
      }

      const { userWorkspaceRoleMap } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'userWorkspaceRoleMap',
        ]);
      const rolePermissionConfig = resolveRolePermissionConfig({
        authContext,
        userWorkspaceRoleMap,
        apiKeyRoleMap: {},
      });

      if (!isDefined(rolePermissionConfig)) {
        return null;
      }

      return {
        workspaceId,
        userWorkspaceId,
        authContext,
        rolePermissionConfig,
      };
    } catch {
      return null;
    }
  }
}
