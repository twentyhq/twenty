import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { WorkspaceInvitation } from 'src/engine/core-modules/workspace-invitation/dtos/workspace-invitation.dto';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { User } from 'src/engine/core-modules/user/user.entity';
import { SendInviteLink } from 'src/engine/core-modules/workspace/dtos/send-invite-link.entity';

@UseGuards(JwtAuthGuard)
@Resolver()
export class WorkspaceInvitationResolver {
  constructor(
    private readonly workspaceInvitationService: WorkspaceInvitationService,
  ) {}

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async deleteWorkspaceInvitation(
    @Args('appTokenId') appTokenId: string,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.workspaceInvitationService.deleteWorkspaceInvitation(
      appTokenId,
      workspaceId,
    );
  }

  @Mutation(() => SendInviteLink)
  @UseGuards(JwtAuthGuard)
  async resendWorkspaceInvitation(
    @Args('appTokenId') appTokenId: string,
    @AuthWorkspace() workspace: Workspace,
    @AuthUser() user: User,
  ) {
    return this.workspaceInvitationService.resendWorkspaceInvitation(
      appTokenId,
      workspace,
      user,
    );
  }

  @Query(() => [WorkspaceInvitation])
  @UseGuards(JwtAuthGuard)
  async findWorkspaceInvitations(@AuthWorkspace() workspace: Workspace) {
    return this.workspaceInvitationService.loadWorkspaceInvitations(workspace);
  }
}
