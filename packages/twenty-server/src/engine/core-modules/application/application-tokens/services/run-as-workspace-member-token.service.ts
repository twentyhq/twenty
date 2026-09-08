import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { RUN_AS_WORKSPACE_MEMBER_TOKEN_EXPIRES_IN } from 'src/engine/core-modules/application/application-tokens/constants/run-as-workspace-member-token-expires-in.constant';
import { type AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';

@Injectable()
// oxlint-disable-next-line twenty/inject-workspace-repository
export class RunAsWorkspaceMemberTokenService {
  constructor(
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly applicationTokenService: ApplicationTokenService,
  ) {}

  async generateAccessToken({
    application,
    workspaceId,
    workspaceMemberId,
    isDelegatedToUser,
  }: {
    application: Pick<FlatApplication, 'id' | 'defaultRoleId'>;
    workspaceId: string;
    workspaceMemberId: string;
    isDelegatedToUser: boolean;
  }): Promise<AuthToken> {
    // resolveRoleIdsForUser falls back to the member's role alone when the application has none, which would widen the caller's reach.
    if (!isDefined(application.defaultRoleId)) {
      throw new AuthException(
        'An application without a default role cannot act as a workspace member.',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
        {
          userFriendlyMessage: msg`This application has no role and cannot read data on your behalf.`,
        },
      );
    }

    // A caller that already carries a user has nothing to narrow; granting it would only refresh its own expiry.
    if (isDelegatedToUser) {
      throw new AuthException(
        'An application token issued for a user cannot request a member-scoped token.',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
        {
          userFriendlyMessage: msg`This application is already acting for a user and cannot request access as a workspace member.`,
        },
      );
    }

    const workspaceMember = await this.userWorkspaceService.getWorkspaceMember({
      workspaceMemberId,
      workspaceId,
    });

    if (!isDefined(workspaceMember)) {
      throw new AuthException(
        'Workspace member not found.',
        AuthExceptionCode.USER_NOT_FOUND,
        { userFriendlyMessage: msg`Workspace member not found.` },
      );
    }

    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUser({
        userId: workspaceMember.userId,
        workspaceId,
        relations: [],
      });

    if (!isDefined(userWorkspace)) {
      throw new AuthException(
        'Workspace member has no user workspace in this workspace.',
        AuthExceptionCode.USER_NOT_FOUND,
        {
          userFriendlyMessage: msg`Workspace member has no access to this workspace.`,
        },
      );
    }

    return this.applicationTokenService.generateApplicationAccessToken({
      workspaceId,
      applicationId: application.id,
      userId: workspaceMember.userId,
      userWorkspaceId: userWorkspace.id,
      isActingAsWorkspaceMember: true,
      expiresIn: RUN_AS_WORKSPACE_MEMBER_TOKEN_EXPIRES_IN,
    });
  }
}
