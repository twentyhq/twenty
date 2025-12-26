import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { SendInvitationsOutput } from 'src/engine/core-modules/workspace-invitation/dtos/send-invitations.output';
import { WorkspaceInvitation } from 'src/engine/core-modules/workspace-invitation/dtos/workspace-invitation.dto';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

import { SendInvitationsInput } from './dtos/send-invitations.input';

@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKSPACE_MEMBERS),
)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@Resolver()
export class WorkspaceInvitationResolver {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceInvitationService: WorkspaceInvitationService,
  ) {}

  @Mutation(() => String)
  async deleteWorkspaceInvitation(
    @Args('appTokenId') appTokenId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
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
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
  ) {
    const authContext = buildSystemAuthContext(workspace.id);

    const workspaceMember =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const workspaceMemberRepository =
            await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
              workspace.id,
              'workspaceMember',
              { shouldBypassPermissionChecks: true },
            );

          return workspaceMemberRepository.findOneOrFail({
            where: {
              userId: user.id,
            },
          });
        },
      );

    return this.workspaceInvitationService.resendWorkspaceInvitation(
      appTokenId,
      workspace,
      workspaceMember,
    );
  }

  @Query(() => [WorkspaceInvitation])
  async findWorkspaceInvitations(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.workspaceInvitationService.loadWorkspaceInvitations(workspace);
  }

  @Mutation(() => SendInvitationsOutput)
  @UseGuards(UserAuthGuard)
  async sendInvitations(
    @Args() sendInviteLinkInput: SendInvitationsInput,
    @AuthUser() user: UserEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SendInvitationsOutput> {
    const authContext = buildSystemAuthContext(workspace.id);

    const workspaceMember =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const workspaceMemberRepository =
            await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
              workspace.id,
              'workspaceMember',
              { shouldBypassPermissionChecks: true },
            );

          return workspaceMemberRepository.findOneOrFail({
            where: {
              userId: user.id,
            },
          });
        },
      );

    return await this.workspaceInvitationService.sendInvitations(
      sendInviteLinkInput.emails,
      workspace,
      workspaceMember,
    );
  }
}
