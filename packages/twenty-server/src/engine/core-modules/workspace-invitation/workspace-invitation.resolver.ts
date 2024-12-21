import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { WorkspaceInvitation } from 'src/engine/core-modules/workspace-invitation/dtos/workspace-invitation.dto';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { User } from 'src/engine/core-modules/user/user.entity';
import { SendInvitationsOutput } from 'src/engine/core-modules/workspace-invitation/dtos/send-invitations.output';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';

import { SendInvitationsInput } from './dtos/send-invitations.input';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
export class WorkspaceInvitationResolver {
  constructor(
    private readonly workspaceInvitationService: WorkspaceInvitationService,
  ) {}

  @Mutation(() => String)
  async deleteWorkspaceInvitation(
    @Args('appTokenId') appTokenId: string,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.workspaceInvitationService.deleteWorkspaceInvitation(
      appTokenId,
      workspaceId,
    );
  }

  @Mutation(() => SendInvitationsOutput)
  @UseGuards(UserAuthGuard)
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
  async findWorkspaceInvitations(@AuthWorkspace() workspace: Workspace) {
    return this.workspaceInvitationService.loadWorkspaceInvitations(workspace);
  }

  @Mutation(() => SendInvitationsOutput)
  @UseGuards(UserAuthGuard)
  async sendInvitations(
    @Args() sendInviteLinkInput: SendInvitationsInput,
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<SendInvitationsOutput> {
    return await this.workspaceInvitationService.sendInvitations(
      sendInviteLinkInput.emails,
      workspace,
      user,
    );
  }
}
