import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { isNonEmptyString } from '@sniptt/guards';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { fromUserEntityToFlat } from 'src/engine/core-modules/user/utils/from-user-entity-to-flat.util';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class UserWorkspaceAuthContextService {
  constructor(
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  // Checking what someone other than the caller can do starts from their
  // member record rather than a session.
  async resolveForWorkspaceMember({
    workspaceId,
    workspaceMemberId,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
  }) {
    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);
    const workspaceMember = flatWorkspaceMemberMaps.byId[workspaceMemberId];

    if (!isDefined(workspaceMember) || isDefined(workspaceMember.deletedAt)) {
      return null;
    }

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId: workspaceMember.userId, workspaceId },
      select: { id: true },
    });

    if (!isDefined(userWorkspace)) {
      return null;
    }

    // A member who can no longer sign in is not the caller's authentication
    // failing, so it must not surface as one.
    try {
      return await this.resolve({
        workspaceId,
        userWorkspaceId: userWorkspace.id,
      });
    } catch (error) {
      if (error instanceof AuthException) {
        return null;
      }

      throw error;
    }
  }

  // Queued work and subscriptions must rebuild their subject after membership changes.
  async resolve({
    workspaceId,
    userWorkspaceId,
    applicationId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    applicationId?: string | null;
  }) {
    if (!isNonEmptyString(workspaceId) || !isNonEmptyString(userWorkspaceId)) {
      throw new AuthException(
        'Workspace membership required',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { id: userWorkspaceId, workspaceId },
      relations: { user: true },
    });
    if (
      !isDefined(userWorkspace) ||
      !isDefined(userWorkspace.user) ||
      userWorkspace.user.disabled ||
      isDefined(userWorkspace.user.deletedAt)
    ) {
      throw new AuthException(
        'User workspace not found',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }
    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);
    const workspaceMemberId =
      flatWorkspaceMemberMaps.idByUserId[userWorkspace.userId];
    const workspaceMember = isDefined(workspaceMemberId)
      ? flatWorkspaceMemberMaps.byId[workspaceMemberId]
      : undefined;
    if (
      !isDefined(workspaceMemberId) ||
      !isDefined(workspaceMember) ||
      isDefined(workspaceMember.deletedAt)
    ) {
      throw new AuthException(
        'Workspace member not found',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }
    const requestContext = workspaceAuthContextStorage.getStore();
    const matchingUserContext =
      isDefined(requestContext) &&
      isUserAuthContext(requestContext) &&
      requestContext.workspace.id === workspaceId &&
      requestContext.userWorkspaceId === userWorkspaceId
        ? requestContext
        : undefined;
    let application =
      applicationId === undefined
        ? matchingUserContext?.application
        : undefined;
    if (isDefined(applicationId)) {
      const { flatApplicationMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatApplicationMaps',
        ]);
      application = flatApplicationMaps.byId[applicationId];
      if (!isDefined(application) || !isDefined(application.defaultRoleId)) {
        throw new AuthException(
          'Application no longer has access',
          AuthExceptionCode.UNAUTHENTICATED,
        );
      }
    }
    return buildUserAuthContext({
      workspace: { id: workspaceId } as FlatWorkspace,
      application,
      viaApplication: matchingUserContext?.viaApplication,
      userWorkspaceId,
      user: fromUserEntityToFlat(userWorkspace.user),
      workspaceMemberId,
      workspaceMember,
    });
  }
}
