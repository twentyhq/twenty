/* @license Enterprise */

import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import {
  INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
  PermissionFlagType,
} from 'twenty-shared/constants';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { BillingEndTrialPeriodDTO } from 'src/engine/core-modules/billing/dtos/billing-end-trial-period.dto';
import { BillingResourceCreditUsageDTO } from 'src/engine/core-modules/billing/dtos/billing-resource-credit-usage.dto';
import { BillingPlanDTO } from 'src/engine/core-modules/billing/dtos/billing-plan.dto';
import { BillingPartnerCodeDTO } from 'src/engine/core-modules/billing/dtos/billing-partner-code.dto';
import { BillingPaymentIntentDTO } from 'src/engine/core-modules/billing/dtos/billing-payment-intent.dto';
import { BillingSessionDTO } from 'src/engine/core-modules/billing/dtos/billing-session.dto';
import { BillingUpdateDTO } from 'src/engine/core-modules/billing/dtos/billing-update.dto';
import { BillingCheckoutSessionInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-checkout-session.input';
import { BillingSetPartnerCodeInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-set-partner-code.input';
import { BillingSessionInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-session.input';
import { BillingSwitchPlanInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-switch-plan.input';
import { BillingUpdateUserCreditsFallbackInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-update-user-credits-fallback.input';
import { BillingUpdateSubscriptionItemPriceInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-update-subscription-item-price.input';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingPartnerCodeService } from 'src/engine/core-modules/billing/services/billing-partner-code.service';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingPortalWorkspaceService } from 'src/engine/core-modules/billing/services/billing-portal.workspace-service';
import { BillingSubscriptionUpdateService } from 'src/engine/core-modules/billing/services/billing-subscription-update.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { formatBillingDatabaseProductToGraphqlDTO } from 'src/engine/core-modules/billing/utils/format-database-product-to-graphql-dto.util';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AllowSuspendedWorkspace } from 'src/engine/decorators/auth/allow-suspended-workspace.decorator';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/permissions/utils/permissions-graphql-api-exception.filter';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

const BILLING_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: false,
  },
  requiredPermissionFlags: [PermissionFlagType.BILLING],
};

const BILLING_CHECKOUT_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: { withUser: true, withoutUser: false },
    application: { withUser: true, withoutUser: false },
  },
  requiredPermissionFlags: [],
};

const BILLING_PARTNER_CODE_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: false,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  },
  requiredPermissionFlags: [PermissionFlagType.WORKSPACE],
};

const BILLING_PLAN_READ_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  },
  requiredPermissionFlags: [],
};

@MetadataResolver()
@AllowSuspendedWorkspace()
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
    private readonly billingPartnerCodeService: BillingPartnerCodeService,
    private readonly billingUsageService: BillingUsageService,
    private readonly settingPermissionsService: SettingPermissionsService,
  ) {}

  @Query(() => BillingSessionDTO)
  @UseGuards(AccessPolicyGuard(BILLING_ACCESS_POLICY))
  async billingPortalSession(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args() { returnUrlPath, forPaymentMethodUpdate }: BillingSessionInput,
  ) {
    return {
      url: await this.billingPortalWorkspaceService.computeBillingPortalSessionUrlOrThrow(
        workspace,
        returnUrlPath,
        forPaymentMethodUpdate,
      ),
    };
  }

  @Query(() => BillingPartnerCodeDTO)
  @UseGuards(AccessPolicyGuard(BILLING_PARTNER_CODE_ACCESS_POLICY))
  async billingPartnerCode(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<BillingPartnerCodeDTO> {
    return this.billingPartnerCodeService.getPartnerCode(workspace.id);
  }

  @Mutation(() => BillingPartnerCodeDTO)
  @UseGuards(AccessPolicyGuard(BILLING_PARTNER_CODE_ACCESS_POLICY))
  async setBillingPartnerCode(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args() { partnerCode }: BillingSetPartnerCodeInput,
  ): Promise<BillingPartnerCodeDTO> {
    return this.billingPartnerCodeService.setPartnerCode({
      workspaceId: workspace.id,
      partnerCode,
    });
  }

  @Mutation(() => BillingSessionDTO)
  @UseGuards(AccessPolicyGuard(BILLING_CHECKOUT_ACCESS_POLICY))
  async checkoutSession(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: AuthContextUser,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args()
    {
      recurringInterval,
      successUrlPath,
      plan,
      requirePaymentMethod,
    }: BillingCheckoutSessionInput,
  ) {
    await this.validateCanCheckoutSessionPermissionOrThrow({
      workspaceId: workspace.id,
      workspaceActivationStatus: workspace.activationStatus,
    });

    const billingPricesPerPlan =
      await this.billingPlanService.getSellablePlanPricesByIntervalOrThrow({
        planKey: plan,
        interval: recurringInterval,
      });

    return await this.billingPortalWorkspaceService.withTrialLimitLock({
      userId: user.id,
      userEmail: user.email,
      workspaceId: workspace.id,
      createSubscription: async (isTrialLimitReached) => {
        const isPaymentMethodRequired =
          requirePaymentMethod || isTrialLimitReached;

        const checkoutSessionParams = {
          user,
          workspace,
          successUrlPath,
          plan,
          requirePaymentMethod: isPaymentMethodRequired,
          isTrialLimitReached,
          billingPricesPerPlan,
        };

        if (!isPaymentMethodRequired) {
          const successUrl =
            await this.billingPortalWorkspaceService.createDirectSubscription(
              checkoutSessionParams,
            );

          return {
            url: successUrl,
          };
        }
        const checkoutSessionURL =
          await this.billingPortalWorkspaceService.computeCheckoutSessionURL(
            checkoutSessionParams,
          );

        return {
          url: checkoutSessionURL,
        };
      },
    });
  }

  @Mutation(() => BillingPaymentIntentDTO)
  @UseGuards(AccessPolicyGuard(BILLING_CHECKOUT_ACCESS_POLICY))
  async createSubscriptionPaymentIntent(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: AuthContextUser,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args() { recurringInterval, plan }: BillingCheckoutSessionInput,
    @Args('idempotencyKey', { type: () => String }) idempotencyKey: string,
  ): Promise<BillingPaymentIntentDTO> {
    await this.validateCanCheckoutSessionPermissionOrThrow({
      workspaceId: workspace.id,
      workspaceActivationStatus: workspace.activationStatus,
    });

    const billingPricesPerPlan =
      await this.billingPlanService.getSellablePlanPricesByIntervalOrThrow({
        planKey: plan,
        interval: recurringInterval,
      });

    return await this.billingPortalWorkspaceService.withTrialLimitLock({
      userId: user.id,
      userEmail: user.email,
      workspaceId: workspace.id,
      createSubscription: (isTrialLimitReached) =>
        this.billingPortalWorkspaceService.createSubscriptionPaymentIntent({
          user,
          workspace,
          plan,
          billingPricesPerPlan,
          isTrialLimitReached,
          idempotencyKey,
        }),
    });
  }

  @Mutation(() => BillingPaymentIntentDTO)
  @UseGuards(AccessPolicyGuard(BILLING_ACCESS_POLICY))
  async createBillingPaymentMethodSetupIntent(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<BillingPaymentIntentDTO> {
    return this.billingPortalWorkspaceService.createPaymentMethodSetupIntent(
      workspace,
    );
  }

  @Mutation(() => BillingUpdateDTO)
  @UseGuards(AccessPolicyGuard(BILLING_ACCESS_POLICY))
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

  @Mutation(() => BillingUpdateDTO)
  @UseGuards(AccessPolicyGuard(BILLING_ACCESS_POLICY))
  async switchBillingPlan(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args() { plan }: BillingSwitchPlanInput,
  ) {
    await this.billingSubscriptionUpdateService.changePlan(workspace.id, plan);

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

  @Mutation(() => BillingUpdateDTO)
  @UseGuards(AccessPolicyGuard(BILLING_ACCESS_POLICY))
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

  @Mutation(() => BillingUpdateDTO)
  @UseGuards(AccessPolicyGuard(BILLING_ACCESS_POLICY))
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

  @Mutation(() => BillingUpdateDTO)
  @UseGuards(AccessPolicyGuard(BILLING_ACCESS_POLICY))
  async setResourceCreditSubscriptionPrice(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args() { priceId }: BillingUpdateSubscriptionItemPriceInput,
  ) {
    await this.billingSubscriptionUpdateService.changeResourceCreditPrice(
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

  @Mutation(() => BillingCustomerEntity)
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
      requiredPermissionFlags: [PermissionFlagType.BILLING],
    }),
  )
  async updateUserCreditsFallback(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args() { userCreditsFallback }: BillingUpdateUserCreditsFallbackInput,
  ): Promise<BillingCustomerEntity> {
    return this.billingService.updateUserCreditsFallbackOrThrow({
      workspaceId: workspace.id,
      userCreditsFallback,
    });
  }

  @Query(() => [BillingPlanDTO])
  @UseGuards(AccessPolicyGuard(BILLING_PLAN_READ_ACCESS_POLICY))
  async billingPlans(): Promise<BillingPlanDTO[]> {
    const plans = await this.billingPlanService.listPlans();

    return plans.map(formatBillingDatabaseProductToGraphqlDTO);
  }

  @Query(() => [BillingPlanDTO], {
    deprecationReason: 'Use billingPlans instead.',
  })
  @UseGuards(AccessPolicyGuard(BILLING_PLAN_READ_ACCESS_POLICY))
  async listPlans(): Promise<BillingPlanDTO[]> {
    return this.billingPlans();
  }

  @Mutation(() => BillingEndTrialPeriodDTO)
  @UseGuards(AccessPolicyGuard(BILLING_ACCESS_POLICY))
  async endSubscriptionTrialPeriod(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<BillingEndTrialPeriodDTO> {
    const result =
      await this.billingSubscriptionService.endTrialPeriod(workspace);

    if (!result.hasPaymentMethod && result.stripeCustomerId) {
      const billingPortalUrl =
        await this.billingPortalWorkspaceService.computeBillingPortalSessionUrlForPaymentMethodUpdate(
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
      currentBillingSubscription:
        await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
          { workspaceId: workspace.id },
        ),
      billingSubscriptions:
        await this.billingSubscriptionService.getBillingSubscriptions(
          workspace.id,
        ),
    };
  }

  @Query(() => [BillingResourceCreditUsageDTO])
  @UseGuards(
    AccessPolicyGuard({
      authPrincipals: {
        userSession: {
          standard: true,
          impersonated: true,
          playground: true,
          workspaceAgnostic: false,
        },
        apiKey: true,
        oauthClient: true,
        application: true,
      },
      requiredPermissionFlags: [PermissionFlagType.BILLING],
    }),
  )
  async getResourceCreditUsage(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<BillingResourceCreditUsageDTO[]> {
    const usageData =
      await this.billingUsageService.getResourceCreditProductUsage(workspace);

    return usageData.map((item) => ({
      ...item,
      workspaceCreditsUsed: toDisplayCredits(item.workspaceCreditsUsed),
      userCreditsUsed: toDisplayCredits(item.userCreditsUsed),
      workspaceCreditsGranted: toDisplayCredits(item.workspaceCreditsGranted),
      workspaceCreditsGrantedForSeats: toDisplayCredits(
        item.workspaceCreditsGrantedForSeats,
      ),
      workspaceCreditsExtraGranted: toDisplayCredits(
        item.workspaceCreditsExtraGranted,
      ),
      workspaceCreditsTotalGranted: toDisplayCredits(
        item.workspaceCreditsTotalGranted,
      ),
      unitPriceCents: item.unitPriceCents * INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
    }));
  }

  @Mutation(() => BillingUpdateDTO)
  @UseGuards(AccessPolicyGuard(BILLING_ACCESS_POLICY))
  async cancelSwitchResourceCreditPrice(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    await this.billingSubscriptionUpdateService.cancelSwitchResourceCreditPrice(
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
    workspaceActivationStatus,
  }: {
    workspaceId: string;
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
      await this.settingPermissionsService.hasPermissionFlag({
        authContext: workspaceAuthContextStorage.getStore(),
        permissionFlag: PermissionFlagType.BILLING,
      });

    if (!userHasPermission) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }
  }
}
