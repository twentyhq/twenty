import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { AuthTokens } from 'src/engine/core-modules/auth/dto/token.entity';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

import {
  ImpersonateWorkspaceMemberInput,
  ImpersonateWorkspaceUserInput,
} from './dtos/impersonate-workspace-user.input';
import { WorkspaceImpersonationService } from './services/workspace-impersonation.service';

@Resolver()
@UsePipes(ResolverValidationPipe)
export class WorkspaceImpersonationResolver {
  constructor(
    private readonly workspaceImpersonationService: WorkspaceImpersonationService,
    private readonly userWorkspaceService: UserWorkspaceService,
  ) {}

  @UseGuards(
    WorkspaceAuthGuard,
    UserAuthGuard,
    SettingsPermissionsGuard(PermissionFlagType.IMPERSONATE),
  )
  @Mutation(() => AuthTokens)
  async impersonateWorkspaceUser(
    @Args() { targetUserWorkspaceId }: ImpersonateWorkspaceUserInput,
    @AuthWorkspace() workspace: Workspace,
    @AuthUser() user: User,
  ): Promise<AuthTokens> {
    const currentUserWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
        userId: user.id,
        workspaceId: workspace.id,
      });

    return await this.workspaceImpersonationService.impersonateWorkspaceUser({
      workspaceId: workspace.id,
      impersonatorUserWorkspaceId: currentUserWorkspace.id,
      targetUserWorkspaceId,
    });
  }

  @UseGuards(
    WorkspaceAuthGuard,
    UserAuthGuard,
    SettingsPermissionsGuard(PermissionFlagType.IMPERSONATE),
  )
  @Mutation(() => AuthTokens)
  async impersonateWorkspaceUserByWorkspaceMemberId(
    @Args() { targetWorkspaceMemberId }: ImpersonateWorkspaceMemberInput,
    @AuthWorkspace() workspace: Workspace,
    @AuthUser() user: User,
  ): Promise<AuthTokens> {
    const currentUserWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
        userId: user.id,
        workspaceId: workspace.id,
      });

    return await this.workspaceImpersonationService.impersonateWorkspaceUserByMemberId(
      {
        workspaceId: workspace.id,
        impersonatorUserWorkspaceId: currentUserWorkspace.id,
        targetWorkspaceMemberId,
      },
    );
  }
}
