/* @license Enterprise */

import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { BillingCheckoutSessionInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-checkout-session.input';
import { BillingSessionInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-session.input';
import { BillingUpdateSubscriptionItemPriceInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-update-subscription-item-price.input';
import { BillingEndTrialPeriodOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-end-trial-period.output';
import { BillingMeteredProductUsageOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-metered-product-usage.output';
import { BillingPlanOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-plan.output';
import { BillingSessionOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-session.output';
import { BillingUpdateOutput } from 'src/engine/core-modules/billing/dtos/outputs/billing-update.output';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingPortalWorkspaceService } from 'src/engine/core-modules/billing/services/billing-portal.workspace-service';
import { BillingSubscriptionUpdateService } from 'src/engine/core-modules/billing/services/billing-subscription-update.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { formatBillingDatabaseProductToGraphqlDTO } from 'src/engine/core-modules/billing/utils/format-database-product-to-graphql-dto.util';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class BillingResolver {
  constructor(
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingSubscriptionUpdateService: BillingSubscriptionUpdateService,
    private readonly billingPortalWorkspaceService: BillingPortalWorkspaceService,
    private readonly billingPlanService: BillingPlanService,
    private readonly billingService: BillingService,
    private readonly billingUsageService: BillingUsageService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Query(() => BillingSessionOutput)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.BILLING),
  )
  async billingPortalSession(
    @AuthWorkspace() workspace: WorkspaceEntity,
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
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, NoPermissionGuard)
  async checkoutSession(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args()
    {
      recurringInterval,
      successUrlPath,
      plan,
      requirePaymentMethod,
    }: BillingCheckoutSessionInput,
    @AuthApiKey() apiKey?: ApiKeyEntity,
  ) {
    await this.validateCanCheckoutSessionPermissionOrThrow({
      workspaceId: workspace.id,
      userWorkspaceId,
      apiKeyId: apiKey?.id,
      workspaceActivationStatus: workspace.activationStatus,
    });

    const checkoutSessionParams = {
      user,
      workspace,
      successUrlPath,
      plan: plan ?? BillingPlanKey.PRO,
      requirePaymentMethod,
    };

    const billingPricesPerPlan =
      await this.billingPlanService.getPricesPerPlanByInterval({
        planKey: checkoutSessionParams.plan,
        interval: recurringInterval,
      });

    // For 7-day trials (no payment method required), create subscription directly
    // For 30-day trials (payment method required), use checkout session flow
    if (!requirePaymentMethod) {
      const successUrl =
        await this.billingPortalWorkspaceService.createDirectSubscription({
          ...checkoutSessionParams,
          billingPricesPerPlan,
        });

      return {
        url: successUrl,
      };
    } else {
      const checkoutSessionURL =
        await this.billingPortalWorkspaceService.computeCheckoutSessionURL({
          ...checkoutSessionParams,
          billingPricesPerPlan,
        });

      return {
        url: checkoutSessionURL,
      };
    }
  }

  @Mutation(() => BillingUpdateOutput)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.BILLING),
  )
  async switchSubscriptionInterval(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    await this.billingSubscriptionUpdateService.changeInterval(workspace.id);

    return {
      billingSubscriptions:
        await this.billingSubscriptionService.getBillingSubscriptions(
          workspace.id,
        ),
      currentBillingSubscription:
        await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
          { workspaceId: workspace.id },
        ),
    };
  }

  @Mutation(() => BillingUpdateOutput)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.BILLING),
  )
  async switchBillingPlan(@AuthWorkspace() workspace: WorkspaceEntity) {
    await this.billingSubscriptionUpdateService.changePlan(workspace.id);

    return {
      billingSubscriptions:
        await this.billingSubscriptionService.getBillingSubscriptions(
          workspace.id,
        ),
      currentBillingSubscription:
        await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
          { workspaceId: workspace.id },
        ),
    };
  }

  @Mutation(() => BillingUpdateOutput)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.BILLING),
  )
  async cancelSwitchBillingPlan(@AuthWorkspace() workspace: WorkspaceEntity) {
    await this.billingSubscriptionUpdateService.cancelSwitchPlan(workspace.id);

    return {
      billingSubscriptions:
        await this.billingSubscriptionService.getBillingSubscriptions(
          workspace.id,
        ),
      currentBillingSubscription:
        await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
          { workspaceId: workspace.id },
        ),
    };
  }

  @Mutation(() => BillingUpdateOutput)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.BILLING),
  )
  async cancelSwitchBillingInterval(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    await this.billingSubscriptionUpdateService.cancelSwitchInterval(
      workspace.id,
    );

    return {
      billingSubscriptions:
        await this.billingSubscriptionService.getBillingSubscriptions(
          workspace.id,
        ),
      currentBillingSubscription:
        await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
          { workspaceId: workspace.id },
        ),
    };
  }

  @Mutation(() => BillingUpdateOutput)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.BILLING),
  )
  async setMeteredSubscriptionPrice(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args() { priceId }: BillingUpdateSubscriptionItemPriceInput,
  ) {
    await this.billingSubscriptionUpdateService.changeMeteredPrice(
      workspace.id,
      priceId,
    );

    return {
      billingSubscriptions:
        await this.billingSubscriptionService.getBillingSubscriptions(
          workspace.id,
        ),
      currentBillingSubscription:
        await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
          { workspaceId: workspace.id },
        ),
    };
  }

  @Query(() => [BillingPlanOutput])
  @UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
  async listPlans(): Promise<BillingPlanOutput[]> {
    const plans = await this.billingPlanService.listPlans();

    return plans.map(formatBillingDatabaseProductToGraphqlDTO);
  }

  @Mutation(() => BillingEndTrialPeriodOutput)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.BILLING),
  )
  async endSubscriptionTrialPeriod(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<BillingEndTrialPeriodOutput> {
    const result =
      await this.billingSubscriptionService.endTrialPeriod(workspace);

    if (!result.hasPaymentMethod && result.stripeCustomerId) {
      const billingPortalUrl =
        await this.billingPortalWorkspaceService.computeBillingPortalSessionURLForPaymentMethodUpdate(
          workspace,
          result.stripeCustomerId,
          '/settings/billing',
        );

      return {
        hasPaymentMethod: false,
        status: undefined,
        billingPortalUrl,
      };
    }

    return {
      hasPaymentMethod: result.hasPaymentMethod,
      status: result.status,
    };
  }

  @Query(() => [BillingMeteredProductUsageOutput])
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.BILLING),
  )
  async getMeteredProductsUsage(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<BillingMeteredProductUsageOutput[]> {
    return await this.billingUsageService.getMeteredProductsUsage(workspace);
  }

  @Mutation(() => BillingUpdateOutput)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.BILLING),
  )
  async cancelSwitchMeteredPrice(@AuthWorkspace() workspace: WorkspaceEntity) {
    await this.billingSubscriptionUpdateService.cancelSwitchMeteredPrice(
      workspace,
    );

    return {
      billingSubscriptions:
        await this.billingSubscriptionService.getBillingSubscriptions(
          workspace.id,
        ),
      currentBillingSubscription:
        await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
          { workspaceId: workspace.id },
        ),
    };
  }

  private async validateCanCheckoutSessionPermissionOrThrow({
    workspaceId,
    userWorkspaceId,
    apiKeyId,
    workspaceActivationStatus,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    apiKeyId?: string;
    workspaceActivationStatus: WorkspaceActivationStatus;
  }) {
    if (
      (await this.billingService.isSubscriptionIncompleteOnboardingStatus(
        workspaceId,
      )) ||
      workspaceActivationStatus ===
        WorkspaceActivationStatus.PENDING_CREATION ||
      workspaceActivationStatus === WorkspaceActivationStatus.ONGOING_CREATION
    ) {
      return;
    }

    const userHasPermission =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId,
        workspaceId,
        setting: PermissionFlagType.BILLING,
        apiKeyId,
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
