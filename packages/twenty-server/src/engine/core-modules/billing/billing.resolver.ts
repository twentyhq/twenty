/* @license Enterprise */

import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { BillingCheckoutSessionInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-checkout-session.input';
import { BillingSessionInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-session.input';
import { BillingEndTrialPeriodOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-end-trial-period.output';
import { BillingMeteredProductUsageOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-metered-product-usage.output';
import { BillingPlanOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-plan.output';
import { BillingSessionOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-session.output';
import { BillingUpdateOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-update.output';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingPortalWorkspaceService } from 'src/engine/core-modules/billing/services/billing-portal.workspace-service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { BillingPortalCheckoutSessionParameters } from 'src/engine/core-modules/billing/types/billing-portal-checkout-session-parameters.type';
import { formatBillingDatabaseProductToGraphqlDTO } from 'src/engine/core-modules/billing/utils/format-database-product-to-graphql-dto.util';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@Resolver()
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class BillingResolver {
  constructor(
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingPortalWorkspaceService: BillingPortalWorkspaceService,
    private readonly billingPlanService: BillingPlanService,
    private readonly billingService: BillingService,
    private readonly billingUsageService: BillingUsageService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Query(() => BillingSessionOutput)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionsGuard(SettingPermissionType.WORKSPACE),
  )
  async billingPortalSession(
    @AuthWorkspace() workspace: Workspace,
    @Args() { returnUrlPath }: BillingSessionInput,
  ) {
    return {
      url: await this.billingPortalWorkspaceService.computeBillingPortalSessionURLOrThrow(
        workspace,
        returnUrlPath,
      ),
    };
  }

  @Mutation(() => BillingSessionOutput)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async checkoutSession(
    @AuthWorkspace() workspace: Workspace,
    @AuthUser() user: User,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args()
    {
      recurringInterval,
      successUrlPath,
      plan,
      requirePaymentMethod,
    }: BillingCheckoutSessionInput,
    @AuthApiKey() apiKey?: string,
  ) {
    await this.validateCanCheckoutSessionPermissionOrThrow({
      workspaceId: workspace.id,
      userWorkspaceId,
      isExecutedByApiKey: isDefined(apiKey),
    });

    const checkoutSessionParams: BillingPortalCheckoutSessionParameters = {
      user,
      workspace,
      successUrlPath,
      plan: plan ?? BillingPlanKey.PRO,
      requirePaymentMethod,
    };

    const billingPricesPerPlan = await this.billingPlanService.getPricesPerPlan(
      {
        planKey: checkoutSessionParams.plan,
        interval: recurringInterval,
      },
    );
    const checkoutSessionURL =
      await this.billingPortalWorkspaceService.computeCheckoutSessionURL({
        ...checkoutSessionParams,
        billingPricesPerPlan,
      });

    return {
      url: checkoutSessionURL,
    };
  }

  @Mutation(() => BillingUpdateOutput)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionsGuard(SettingPermissionType.WORKSPACE),
  )
  async switchToYearlyInterval(@AuthWorkspace() workspace: Workspace) {
    await this.billingSubscriptionService.switchToYearlyInterval(workspace);

    return { success: true };
  }

  @Query(() => [BillingPlanOutput])
  @UseGuards(WorkspaceAuthGuard)
  async plans(): Promise<BillingPlanOutput[]> {
    const plans = await this.billingPlanService.getPlans();

    return plans.map(formatBillingDatabaseProductToGraphqlDTO);
  }

  @Mutation(() => BillingEndTrialPeriodOutput)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionsGuard(SettingPermissionType.WORKSPACE),
  )
  async endSubscriptionTrialPeriod(
    @AuthWorkspace() workspace: Workspace,
  ): Promise<BillingEndTrialPeriodOutput> {
    return await this.billingSubscriptionService.endTrialPeriod(workspace);
  }

  @Query(() => [BillingMeteredProductUsageOutput])
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionsGuard(SettingPermissionType.WORKSPACE),
  )
  async getMeteredProductsUsage(
    @AuthWorkspace() workspace: Workspace,
  ): Promise<BillingMeteredProductUsageOutput[]> {
    return await this.billingUsageService.getMeteredProductsUsage(workspace);
  }

  private async validateCanCheckoutSessionPermissionOrThrow({
    workspaceId,
    userWorkspaceId,
    isExecutedByApiKey,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    isExecutedByApiKey: boolean;
  }) {
    if (
      await this.billingService.isSubscriptionIncompleteOnboardingStatus(
        workspaceId,
      )
    ) {
      return;
    }

    const userHasPermission =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId,
        workspaceId,
        setting: SettingPermissionType.WORKSPACE,
        isExecutedByApiKey,
      });

    if (!userHasPermission) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    return;
  }
}
