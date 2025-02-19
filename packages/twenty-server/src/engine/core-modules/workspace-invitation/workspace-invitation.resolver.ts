import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { SendInvitationsOutput } from 'src/engine/core-modules/workspace-invitation/dtos/send-invitations.output';
import { WorkspaceInvitation } from 'src/engine/core-modules/workspace-invitation/dtos/workspace-invitation.dto';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { SendInvitationsInput } from './dtos/send-invitations.input';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
export class WorkspaceInvitationResolver {
  constructor(
    private readonly workspaceInvitationService: WorkspaceInvitationService,
    private readonly fileService: FileService,
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
    let workspaceLogoWithToken = '';

    if (workspace.logo) {
      const workspaceLogoToken = await this.fileService.encodeFileToken({
        workspaceId: workspace.id,
      });

      workspaceLogoWithToken = `${workspace.logo}?token=${workspaceLogoToken}`;
    }

    return await this.workspaceInvitationService.sendInvitations(
      sendInviteLinkInput.emails,
      { ...workspace, logo: workspaceLogoWithToken },
      user,
    );
  }
}
