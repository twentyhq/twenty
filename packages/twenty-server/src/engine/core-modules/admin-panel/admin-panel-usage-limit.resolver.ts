import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { AdminResolver } from 'src/engine/api/graphql/graphql-config/decorators/admin-resolver.decorator';
import {
  AdminPanelCreateUsageLimitInput,
  AdminPanelDeleteUsageLimitInput,
  AdminPanelUpdateUsageLimitInput,
  AdminPanelWorkspaceUsageLimitsInput,
} from 'src/engine/core-modules/admin-panel/dtos/admin-panel-usage-limit.input';
import {
  AdminPanelUsageLimitDTO,
  AdminPanelWorkspaceUsageLimitsDTO,
} from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-usage-limits.dto';
import { AdminPanelUsageLimitService } from 'src/engine/core-modules/admin-panel/services/admin-panel-usage-limit.service';
import { fromUsageLimitEntityToAdminPanelDto } from 'src/engine/core-modules/admin-panel/utils/from-usage-limit-entity-to-admin-panel-dto.util';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';
import { UsageLimitService } from 'src/engine/core-modules/usage-limit/services/usage-limit.service';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';
import { RequireUserSessionGuard } from 'src/engine/guards/require-user-session.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UsePipes(ResolverValidationPipe)
@AdminResolver()
@UseFilters(
  AuthGraphqlApiExceptionFilter,
  UsageLimitGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  RequireUserSessionGuard,
  SettingsPermissionGuard(PermissionFlagType.SECURITY),
)
export class AdminPanelUsageLimitResolver {
  constructor(
    private readonly adminPanelUsageLimitService: AdminPanelUsageLimitService,
    private readonly usageLimitService: UsageLimitService,
  ) {}

  @UseGuards(AdminPanelGuard)
  @Query(() => AdminPanelWorkspaceUsageLimitsDTO)
  async workspaceUsageLimits(
    @Args() { workspaceId }: AdminPanelWorkspaceUsageLimitsInput,
  ): Promise<AdminPanelWorkspaceUsageLimitsDTO> {
    return this.adminPanelUsageLimitService.findWorkspaceUsageLimits(
      workspaceId,
    );
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => AdminPanelUsageLimitDTO)
  async createWorkspaceUsageLimit(
    @Args() { workspaceId, payload }: AdminPanelCreateUsageLimitInput,
  ): Promise<AdminPanelUsageLimitDTO> {
    const usageLimit = await this.usageLimitService.create({
      workspaceId,
      input: payload,
      isOperator: true,
    });

    return fromUsageLimitEntityToAdminPanelDto(usageLimit);
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => AdminPanelUsageLimitDTO)
  async updateWorkspaceUsageLimit(
    @Args() { workspaceId, payload }: AdminPanelUpdateUsageLimitInput,
  ): Promise<AdminPanelUsageLimitDTO> {
    const usageLimit = await this.usageLimitService.update({
      workspaceId,
      input: payload,
      isOperator: true,
    });

    return fromUsageLimitEntityToAdminPanelDto(usageLimit);
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async deleteWorkspaceUsageLimit(
    @Args() { workspaceId, usageLimitId }: AdminPanelDeleteUsageLimitInput,
  ): Promise<boolean> {
    return this.usageLimitService.delete({
      workspaceId,
      usageLimitId,
      isOperator: true,
    });
  }
}
