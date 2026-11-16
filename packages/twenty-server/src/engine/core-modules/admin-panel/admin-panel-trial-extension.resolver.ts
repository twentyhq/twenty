import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { isNonEmptyString } from '@sniptt/guards';

import { AdminResolver } from 'src/engine/api/graphql/graphql-config/decorators/admin-resolver.decorator';
import {
  AdminPanelExtendWorkspaceTrialInput,
  AdminPanelRevokeWorkspaceTrialExtensionInput,
} from 'src/engine/core-modules/admin-panel/dtos/admin-panel-trial-extension.input';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { BillingArrangementLabel } from 'src/engine/core-modules/billing/enums/billing-arrangement-label.enum';
import { BillingGraphqlApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-graphql-api-exception.filter';
import { BillingTrialExtensionService } from 'src/engine/core-modules/billing/services/billing-trial-extension.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@UsePipes(ResolverValidationPipe)
@AdminResolver()
@UseFilters(
  AuthGraphqlApiExceptionFilter,
  BillingGraphqlApiExceptionFilter,
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
export class AdminPanelTrialExtensionResolver {
  constructor(
    private readonly billingTrialExtensionService: BillingTrialExtensionService,
  ) {}

  @Mutation(() => Boolean)
  async extendWorkspaceTrial(
    @Args()
    {
      workspaceId,
      trialEndsAt,
      label,
      comment,
    }: AdminPanelExtendWorkspaceTrialInput,
    @AuthUser() actor: AuthContextUser,
  ): Promise<boolean> {
    const trimmedComment = comment?.trim();

    await this.billingTrialExtensionService.extendTrial({
      workspaceId,
      trialEndsAt,
      label: label ?? BillingArrangementLabel.OTHER,
      comment: isNonEmptyString(trimmedComment) ? trimmedComment : null,
      grantedByUserId: actor.id,
    });

    return true;
  }

  @Mutation(() => Boolean)
  async revokeWorkspaceTrialExtension(
    @Args() { workspaceId }: AdminPanelRevokeWorkspaceTrialExtensionInput,
    @AuthUser() actor: AuthContextUser,
  ): Promise<boolean> {
    await this.billingTrialExtensionService.revokeTrialExtension({
      workspaceId,
      revokedByUserId: actor.id,
    });

    return true;
  }
}
