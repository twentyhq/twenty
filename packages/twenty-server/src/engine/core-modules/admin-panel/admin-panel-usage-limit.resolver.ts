import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

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
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { BillingLimitOverrideService } from 'src/engine/core-modules/billing/limit-override/services/billing-limit-override.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';
import { fromUsageLimitEntityToDto } from 'src/engine/core-modules/usage-limit/utils/from-usage-limit-entity-to-dto.util';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

@UsePipes(ResolverValidationPipe)
@AdminResolver()
@UseFilters(
  AuthGraphqlApiExceptionFilter,
  UsageLimitGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  }),
  NoPermissionGuard,
  AdminPanelGuard,
)
export class AdminPanelUsageLimitResolver {
  constructor(
    private readonly adminPanelUsageLimitService: AdminPanelUsageLimitService,
    private readonly billingLimitOverrideService: BillingLimitOverrideService,
  ) {}

  @Query(() => AdminPanelWorkspaceUsageLimitsDTO)
  async workspaceUsageLimits(
    @Args() { workspaceId }: AdminPanelWorkspaceUsageLimitsInput,
  ): Promise<AdminPanelWorkspaceUsageLimitsDTO> {
    return this.adminPanelUsageLimitService.findWorkspaceUsageLimits(
      workspaceId,
    );
  }

  @Mutation(() => AdminPanelUsageLimitDTO)
  async createWorkspaceUsageLimit(
    @Args() { workspaceId, payload }: AdminPanelCreateUsageLimitInput,
    @AuthUser() actor: AuthContextUser,
  ): Promise<AdminPanelUsageLimitDTO> {
    const usageLimit = await this.billingLimitOverrideService.create({
      workspaceId,
      input: payload,
      grantedByUserId: actor.id,
    });

    return fromUsageLimitEntityToDto(usageLimit);
  }

  @Mutation(() => AdminPanelUsageLimitDTO)
  async updateWorkspaceUsageLimit(
    @Args() { workspaceId, payload }: AdminPanelUpdateUsageLimitInput,
    @AuthUser() actor: AuthContextUser,
  ): Promise<AdminPanelUsageLimitDTO> {
    const usageLimit = await this.billingLimitOverrideService.replace({
      workspaceId,
      input: payload,
      grantedByUserId: actor.id,
    });

    return fromUsageLimitEntityToDto(usageLimit);
  }

  @Mutation(() => Boolean)
  async deleteWorkspaceUsageLimit(
    @Args() { workspaceId, usageLimitId }: AdminPanelDeleteUsageLimitInput,
    @AuthUser() actor: AuthContextUser,
  ): Promise<boolean> {
    return this.billingLimitOverrideService.end({
      workspaceId,
      usageLimitId,
      revokedByUserId: actor.id,
    });
  }
}
