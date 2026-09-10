import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type ApplicationTokenPairDTO } from 'src/engine/core-modules/application/application-oauth/dtos/application-token-pair.dto';
import { resolveWorkspaceMemberForApplicationTokenOrThrow } from 'src/engine/core-modules/application/application-oauth/utils/resolve-workspace-member-for-application-token-or-throw.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
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
  // hold and never exceeds what the member could see themselves.
  async generateTokenPairForWorkspaceMember({
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
  }): Promise<ApplicationTokenPairDTO> {
    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    const workspaceMember = resolveWorkspaceMemberForApplicationTokenOrThrow({
      workspaceMemberId,
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

    return this.applicationTokenService.generateApplicationTokenPair({
      workspaceId,
      applicationId: application.id,
      userId: workspaceMember.userId,
      userWorkspaceId: userWorkspace.id,
    });
  }
}
