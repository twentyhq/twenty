import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { canApplicationTokenRunAsWorkspaceMember } from 'src/engine/core-modules/auth/utils/can-application-token-run-as-workspace-member.util';
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
    requestWorkspaceMemberId,
  }: {
    application: Pick<FlatApplication, 'id' | 'defaultRoleId'>;
    workspaceId: string;
    workspaceMemberId: string;
    isDelegatedToUser: boolean;
    requestWorkspaceMemberId: string | null;
  }): Promise<AuthToken> {
    // Permissions for an application acting as a member are the intersection of
    // both roles, and resolveRoleIdsForUser falls back to the member's role
    // alone when the application declares none, which would widen rather than
    // narrow what the calling token reaches.
    if (!isDefined(application.defaultRoleId)) {
      throw new AuthException(
        'An application without a default role cannot act as a workspace member.',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
        {
          userFriendlyMessage: msg`This application has no role and cannot read data on your behalf.`,
        },
      );
    }

    if (
      !canApplicationTokenRunAsWorkspaceMember({
        isDelegatedToUser,
        requestWorkspaceMemberId,
        workspaceMemberId,
      })
    ) {
      throw new AuthException(
        'An application token issued for a user can only act as that user.',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
        {
          userFriendlyMessage: msg`This application cannot act as another workspace member.`,
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
    });
  }
}
