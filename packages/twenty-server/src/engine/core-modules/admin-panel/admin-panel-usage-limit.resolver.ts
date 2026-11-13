import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { isNonEmptyString } from '@sniptt/guards';

import { AdminResolver } from 'src/engine/api/graphql/graphql-config/decorators/admin-resolver.decorator';
import {
  AdminPanelCreateUsageLimitInput,
  AdminPanelDeleteUsageLimitInput,
  AdminPanelWorkspaceUsageLimitsInput,
} from 'src/engine/core-modules/admin-panel/dtos/admin-panel-usage-limit.input';
import {
  AdminPanelUsageLimitDTO,
  AdminPanelWorkspaceUsageLimitsDTO,
} from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-usage-limits.dto';
import { AdminPanelUsageLimitService } from 'src/engine/core-modules/admin-panel/services/admin-panel-usage-limit.service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { BillingArrangementLabel } from 'src/engine/core-modules/billing/enums/billing-arrangement-label.enum';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';
import { UsageLimitInstanceOverrideService } from 'src/engine/core-modules/usage-limit/instance-override/services/usage-limit-instance-override.service';
import { fromUsageLimitEntityToDto } from 'src/engine/core-modules/usage-limit/utils/from-usage-limit-entity-to-dto.util';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@UsePipes(ResolverValidationPipe)
@AdminResolver()
@UseFilters(
  AuthGraphqlApiExceptionFilter,
  UsageLimitGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    },
    requiredPermissionFlags: [],
  }),
  AdminPanelGuard,
)
export class AdminPanelUsageLimitResolver {
  constructor(
    private readonly adminPanelUsageLimitService: AdminPanelUsageLimitService,
    private readonly usageLimitInstanceOverrideService: UsageLimitInstanceOverrideService,
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
    @Args()
    {
      workspaceId,
      payload,
      endsAt,
      label,
      comment,
    }: AdminPanelCreateUsageLimitInput,
    @AuthUser() actor: AuthContextUser,
  ): Promise<AdminPanelUsageLimitDTO> {
    const trimmedComment = comment?.trim();

    const usageLimit = await this.usageLimitInstanceOverrideService.create({
      workspaceId,
      input: payload,
      endsAt: endsAt ?? null,
      label: label ?? BillingArrangementLabel.OTHER,
      comment: isNonEmptyString(trimmedComment) ? trimmedComment : null,
      grantedByUserId: actor.id,
    });

    return fromUsageLimitEntityToDto(usageLimit);
  }

  @Mutation(() => Boolean)
  async deleteWorkspaceUsageLimit(
    @Args() { workspaceId, usageLimitId }: AdminPanelDeleteUsageLimitInput,
    @AuthUser() actor: AuthContextUser,
  ): Promise<boolean> {
    return this.usageLimitInstanceOverrideService.delete({
      workspaceId,
      usageLimitId,
      revokedByUserId: actor.id,
    });
  }
}
