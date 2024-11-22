import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceInviteHashValidInput } from 'src/engine/core-modules/auth/dto/workspace-invite-hash.input';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { WorkspaceInviteTokenInput } from 'src/engine/core-modules/auth/dto/workspace-invite-token.input';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => UserWorkspace)
export class UserWorkspaceResolver {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly workspaceInvitationService: WorkspaceInvitationService,
  ) {}

  @Mutation(() => User)
  async addUserToWorkspace(
    @AuthUser() user: User,
    @Args() workspaceInviteHashValidInput: WorkspaceInviteHashValidInput,
  ) {
    const workspace = await this.workspaceRepository.findOneBy({
      inviteHash: workspaceInviteHashValidInput.inviteHash,
    });

    if (!workspace) {
      return;
    }

    await this.workspaceInvitationService.invalidateWorkspaceInvitation(
      workspace.id,
      user.email,
    );

    return await this.userWorkspaceService.addUserToWorkspace(user, workspace);
  }

  @Mutation(() => User)
  async addUserToWorkspaceByInviteToken(
    @AuthUser() user: User,
    @Args() workspaceInviteTokenInput: WorkspaceInviteTokenInput,
  ) {
    return this.userWorkspaceService.addUserToWorkspaceByInviteToken(
      workspaceInviteTokenInput.inviteToken,
      user,
    );
  }
}
