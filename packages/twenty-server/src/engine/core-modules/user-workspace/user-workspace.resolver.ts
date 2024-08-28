import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInviteHashValidInput } from 'src/engine/core-modules/auth/dto/workspace-invite-hash.input';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => UserWorkspace)
export class UserWorkspaceResolver {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
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

    await this.workspaceInvitationService.useWorkspaceInvitation(
      workspace.id,
      user.email,
    );

    return await this.userWorkspaceService.addUserToWorkspace(user, workspace);
  }
}
