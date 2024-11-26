import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { AdminPanelService } from 'src/engine/core-modules/admin-panel/admin-panel.service';
import { ImpersonateInput } from 'src/engine/core-modules/admin-panel/dtos/impersonate.input';
import { UpdateWorkspaceFeatureFlagInput } from 'src/engine/core-modules/admin-panel/dtos/update-workspace-feature-flag.input';
import { UserLookup } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.entity';
import { UserLookupInput } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.input';
import { Verify } from 'src/engine/core-modules/auth/dto/verify.entity';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { User } from 'src/engine/core-modules/user/user.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class AdminPanelResolver {
  constructor(private adminService: AdminPanelService) {}

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  @Mutation(() => Verify)
  async impersonate(
    @Args() impersonateInput: ImpersonateInput,
    @AuthUser() user: User,
  ): Promise<Verify> {
    return await this.adminService.impersonate(impersonateInput.userId, user);
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  @Mutation(() => UserLookup)
  async userLookupAdminPanel(
    @Args() userLookupInput: UserLookupInput,
    @AuthUser() user: User,
  ): Promise<UserLookup> {
    return await this.adminService.userLookup(
      userLookupInput.userIdentifier,
      user,
    );
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  @Mutation(() => Boolean)
  async updateWorkspaceFeatureFlag(
    @Args() updateFlagInput: UpdateWorkspaceFeatureFlagInput,
    @AuthUser() user: User,
  ): Promise<boolean> {
    await this.adminService.updateWorkspaceFeatureFlags(
      updateFlagInput.workspaceId,
      updateFlagInput.featureFlag,
      user,
      updateFlagInput.value,
    );

    return true;
  }
}
