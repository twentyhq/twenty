import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { resolveWorkspaceMemberForApplicationTokenOrThrow } from 'src/engine/core-modules/application/application-oauth/utils/resolve-workspace-member-for-application-token-or-throw.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ApplicationWorkspaceMemberTokenService {
  constructor(
    private readonly applicationTokenService: ApplicationTokenService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  // The resulting token carries the member's role intersected with the
  // application's, so the application never gains access it does not already
  // hold and never exceeds what the member could see themselves. Only a
  // short-lived access token is issued: unlike an OAuth grant nobody consented
  // to this credential, so nothing renewable must leave the server.
  async generateAccessTokenForWorkspaceMember({
    workspaceId,
    application,
    workspaceMemberId,
    requestUserWorkspaceId,
    requestWorkspaceMemberId,
  }: {
    workspaceId: string;
    application: FlatApplication;
    workspaceMemberId: string;
    requestUserWorkspaceId: string | null;
    requestWorkspaceMemberId: string | null;
  }): Promise<AuthToken> {
    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    const workspaceMember = resolveWorkspaceMemberForApplicationTokenOrThrow({
      workspaceMemberId,
      applicationDefaultRoleId: application.defaultRoleId ?? null,
      requestUserWorkspaceId,
      requestWorkspaceMemberId,
      flatWorkspaceMemberMaps,
    });

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId: workspaceMember.userId, workspaceId },
    });

    if (!isDefined(userWorkspace)) {
      throw new ApplicationException(
        `Workspace member ${workspaceMemberId} has no user workspace`,
        ApplicationExceptionCode.WORKSPACE_MEMBER_NOT_FOUND,
      );
    }

    return this.applicationTokenService.generateApplicationAccessToken({
      workspaceId,
      applicationId: application.id,
      userId: workspaceMember.userId,
      userWorkspaceId: userWorkspace.id,
    });
  }
}
