import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { isNonEmptyString } from '@sniptt/guards';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import chunk from 'lodash.chunk';
import { In, Repository } from 'typeorm';
import {
  assertIsDefinedOrThrow,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { fromUserEntityToFlat } from 'src/engine/core-modules/user/utils/from-user-entity-to-flat.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const ACTIVE_USER_WORKSPACE_BATCH_SIZE = 1_000;

const isActiveUserWorkspace = (
  userWorkspace: UserWorkspaceEntity | null | undefined,
): userWorkspace is UserWorkspaceEntity =>
  isDefined(userWorkspace) &&
  !isDefined(userWorkspace.deletedAt) &&
  isDefined(userWorkspace.user) &&
  !userWorkspace.user.disabled &&
  !isDefined(userWorkspace.user.deletedAt);

@Injectable()
export class UserWorkspaceAuthContextService {
  constructor(
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  async findActiveUserWorkspaces({
    workspaceId,
    userWorkspaceIds,
  }: {
    workspaceId: string;
    userWorkspaceIds: string[];
  }): Promise<UserWorkspaceEntity[]> {
    if (!isNonEmptyString(workspaceId) || !isNonEmptyArray(userWorkspaceIds)) {
      return [];
    }

    const activeUserWorkspaces: UserWorkspaceEntity[] = [];

    for (const membershipIds of chunk(
      [...new Set(userWorkspaceIds)],
      ACTIVE_USER_WORKSPACE_BATCH_SIZE,
    )) {
      const userWorkspaces = await this.userWorkspaceRepository.find({
        where: { id: In(membershipIds), workspaceId },
        relations: { user: true },
      });

      activeUserWorkspaces.push(
        ...userWorkspaces.filter(isActiveUserWorkspace),
      );
    }

    return activeUserWorkspaces;
  }

  async resolveWorkspaceMember({
    workspaceId,
    workspaceMemberId,
    applicationId,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
    applicationId?: string | null;
  }) {
    if (
      !isNonEmptyString(workspaceId) ||
      !isNonEmptyString(workspaceMemberId)
    ) {
      throw new AuthException(
        'Workspace member required',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }
    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);
    const member = flatWorkspaceMemberMaps.byId[workspaceMemberId];
    if (!isDefined(member) || isDefined(member.deletedAt)) {
      throw new AuthException(
        'Workspace member not found',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }
    const userWorkspaceId =
      flatWorkspaceMemberMaps.userWorkspaceIdByUserId[member.userId];
    if (!isDefined(userWorkspaceId)) {
      throw new AuthException(
        'User workspace not found',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }
    const authContext = await this.resolve({
      workspaceId,
      userWorkspaceId,
      applicationId,
    });
    if (authContext.workspaceMemberId !== workspaceMemberId) {
      throw new AuthException(
        'Workspace member changed',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }
    return authContext;
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
    if (!isActiveUserWorkspace(userWorkspace)) {
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
    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      workspaceId,
    );

    assertIsDefinedOrThrow(
      workspace,
      new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      ),
    );

    return buildUserAuthContext({
      workspace,
      application,
      viaApplication: matchingUserContext?.viaApplication,
      userWorkspaceId,
      user: fromUserEntityToFlat(userWorkspace.user),
      workspaceMemberId,
      workspaceMember,
    });
  }
}
