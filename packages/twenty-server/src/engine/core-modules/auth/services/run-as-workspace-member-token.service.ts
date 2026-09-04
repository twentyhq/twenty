import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

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
    applicationId,
    workspaceId,
    workspaceMemberId,
    requestWorkspaceMemberId,
  }: {
    applicationId: string;
    workspaceId: string;
    workspaceMemberId: string;
    requestWorkspaceMemberId: string | null;
  }): Promise<AuthToken> {
    if (
      isDefined(requestWorkspaceMemberId) &&
      requestWorkspaceMemberId !== workspaceMemberId
    ) {
      throw new ForbiddenException(
        'An application token issued for a user can only act as that user.',
      );
    }

    const workspaceMember = await this.userWorkspaceService.getWorkspaceMember({
      workspaceMemberId,
      workspaceId,
    });

    if (!isDefined(workspaceMember)) {
      throw new NotFoundException('Workspace member not found.');
    }

    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUser({
        userId: workspaceMember.userId,
        workspaceId,
        relations: [],
      });

    if (!isDefined(userWorkspace)) {
      throw new NotFoundException(
        'Workspace member has no user workspace in this workspace.',
      );
    }

    return this.applicationTokenService.generateApplicationAccessToken({
      workspaceId,
      applicationId,
      userId: workspaceMember.userId,
      userWorkspaceId: userWorkspace.id,
    });
  }
}
