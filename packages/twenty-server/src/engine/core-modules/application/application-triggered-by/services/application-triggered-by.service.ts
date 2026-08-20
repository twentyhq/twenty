import { Injectable } from '@nestjs/common';

import { type LogicFunctionTriggeredBy } from 'twenty-shared/application';
import { type PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

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
    const [workspaceMemberId, permissionFlags] = await Promise.all([
      this.resolveWorkspaceMemberId({
        userId: triggeredBy.userId,
        workspaceId,
      }),
      this.resolvePermissionFlags({
        userWorkspaceId: triggeredBy.userWorkspaceId,
        workspaceId,
      }),
    ]);

    return {
      userId: triggeredBy.userId,
      userWorkspaceId: triggeredBy.userWorkspaceId,
      workspaceMemberId,
      permissionFlags,
    };
  }

  private async resolveWorkspaceMemberId({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }): Promise<string | null> {
    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    const workspaceMemberId = flatWorkspaceMemberMaps.idByUserId[userId];

    if (!isDefined(workspaceMemberId)) {
      return null;
    }

    const workspaceMember = flatWorkspaceMemberMaps.byId[workspaceMemberId];

    return isDefined(workspaceMember?.deletedAt) ? null : workspaceMemberId;
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

      return (Object.keys(permissionFlags) as PermissionFlagType[]).filter(
        (permissionFlag) => permissionFlags[permissionFlag] === true,
      );
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
