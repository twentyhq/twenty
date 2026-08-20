import { Injectable } from '@nestjs/common';

import { type LogicFunctionTriggeredBy } from 'twenty-shared/application';
import { type PermissionFlagType } from 'twenty-shared/constants';

import { getGrantedPermissionFlags } from 'src/engine/core-modules/application/application-triggered-by/utils/get-granted-permission-flags.util';
import { resolveTriggeredByWorkspaceMemberId } from 'src/engine/core-modules/application/application-triggered-by/utils/resolve-triggered-by-workspace-member-id.util';
import { type ApplicationTriggeredBy } from 'src/engine/core-modules/auth/types/application-triggered-by.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ApplicationTriggeredByService {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async describe({
    triggeredBy,
    workspaceId,
  }: {
    triggeredBy: ApplicationTriggeredBy;
    workspaceId: string;
  }): Promise<LogicFunctionTriggeredBy> {
    const [{ flatWorkspaceMemberMaps }, permissionFlags] = await Promise.all([
      this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]),
      this.resolvePermissionFlags({
        userWorkspaceId: triggeredBy.userWorkspaceId,
        workspaceId,
      }),
    ]);

    return {
      userId: triggeredBy.userId,
      userWorkspaceId: triggeredBy.userWorkspaceId,
      workspaceMemberId: resolveTriggeredByWorkspaceMemberId({
        userId: triggeredBy.userId,
        flatWorkspaceMemberMaps,
      }),
      permissionFlags,
    };
  }

  private async resolvePermissionFlags({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<PermissionFlagType[]> {
    try {
      const { permissionFlags } =
        await this.permissionsService.getUserWorkspacePermissions({
          userWorkspaceId,
          workspaceId,
        });

      return getGrantedPermissionFlags(permissionFlags);
    } catch (error) {
      // Losing every role is a legitimate state, and the honest answer to
      // "what may this person do" is then "nothing", not an error.
      if (
        error instanceof PermissionsException &&
        error.code === PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE
      ) {
        return [];
      }

      throw error;
    }
  }
}
