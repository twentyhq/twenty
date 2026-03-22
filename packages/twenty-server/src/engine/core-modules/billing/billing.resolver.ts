/* @license Enterprise */

import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, type Repository } from 'typeorm';

import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { BillingCheckoutSessionInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-checkout-session.input';
import { BillingSessionInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-session.input';
import { BillingUpdateSubscriptionItemPriceInput } from 'src/engine/core-modules/billing/dtos/inputs/billing-update-subscription-item-price.input';
import { BillingEndTrialPeriodDTO } from 'src/engine/core-modules/billing/dtos/billing-end-trial-period.dto';
import { BillingMeteredProductUsageDTO } from 'src/engine/core-modules/billing/dtos/billing-metered-product-usage.dto';
import { BillingPlanDTO } from 'src/engine/core-modules/billing/dtos/billing-plan.dto';
import { BillingSessionDTO } from 'src/engine/core-modules/billing/dtos/billing-session.dto';
import { BillingUpdateDTO } from 'src/engine/core-modules/billing/dtos/billing-update.dto';
import { UsageAnalyticsDTO } from 'src/engine/core-modules/billing/dtos/usage-analytics.dto';
import { UsageAnalyticsInput } from 'src/engine/core-modules/billing/dtos/inputs/usage-analytics.input';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import {
  type UsageBreakdownItem,
  UsageAnalyticsService,
} from 'src/engine/core-modules/billing/services/usage-analytics.service';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingPortalWorkspaceService } from 'src/engine/core-modules/billing/services/billing-portal.workspace-service';
import { BillingSubscriptionUpdateService } from 'src/engine/core-modules/billing/services/billing-subscription-update.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { formatBillingDatabaseProductToGraphqlDTO } from 'src/engine/core-modules/billing/utils/format-database-product-to-graphql-dto.util';
import {
  INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
  toDisplayCredits,
} from 'src/engine/core-modules/billing/utils/to-display-credits.util';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
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
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';

@MetadataResolver()
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
    private readonly usageAnalyticsService: UsageAnalyticsService,
    private readonly permissionsService: PermissionsService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
  ) {}

  @Query(() => BillingSessionDTO)
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

  @Mutation(() => BillingSessionDTO)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, NoPermissionGuard)
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

  @Mutation(() => BillingUpdateDTO)
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

  @Mutation(() => BillingUpdateDTO)
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

  @Mutation(() => BillingUpdateDTO)
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

  @Mutation(() => BillingUpdateDTO)
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

  @Mutation(() => BillingUpdateDTO)
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

  @Query(() => [BillingPlanDTO])
  @UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
  async listPlans(): Promise<BillingPlanDTO[]> {
    const plans = await this.billingPlanService.listPlans();

    return plans.map(formatBillingDatabaseProductToGraphqlDTO);
  }

  @Mutation(() => BillingEndTrialPeriodDTO)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.BILLING),
  )
  async endSubscriptionTrialPeriod(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<BillingEndTrialPeriodDTO> {
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

  @Query(() => [BillingMeteredProductUsageDTO])
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.BILLING),
  )
  async getMeteredProductsUsage(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<BillingMeteredProductUsageDTO[]> {
    const usageData =
      await this.billingUsageService.getMeteredProductsUsage(workspace);

    return usageData.map((item) => ({
      ...item,
      usedCredits: toDisplayCredits(item.usedCredits),
      grantedCredits: toDisplayCredits(item.grantedCredits),
      rolloverCredits: toDisplayCredits(item.rolloverCredits),
      totalGrantedCredits: toDisplayCredits(item.totalGrantedCredits),
      unitPriceCents: item.unitPriceCents * INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
    }));
  }

  @Query(() => UsageAnalyticsDTO)
  @UseGuards(
    WorkspaceAuthGuard,
    FeatureFlagGuard,
    SettingsPermissionGuard(PermissionFlagType.BILLING),
  )
  @RequireFeatureFlag(FeatureFlagKey.IS_USAGE_ANALYTICS_ENABLED)
  async getUsageAnalytics(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input', { nullable: true }) input?: UsageAnalyticsInput,
  ): Promise<UsageAnalyticsDTO> {
    const { defaultPeriodStart, defaultPeriodEnd } =
      await this.getDefaultAnalyticsPeriod(workspace.id);

    const periodStart = input?.periodStart ?? defaultPeriodStart;
    const periodEnd = input?.periodEnd ?? defaultPeriodEnd;

    const periodParams = {
      workspaceId: workspace.id,
      periodStart,
      periodEnd,
    };

    const [usageByUser, usageByResource, usageByOperationType, timeSeries] =
      await Promise.all([
        this.usageAnalyticsService.getUsageByUser(periodParams),
        this.usageAnalyticsService.getUsageByResource(periodParams),
        this.usageAnalyticsService.getUsageByOperationType({
          ...periodParams,
          userWorkspaceId: input?.userWorkspaceId ?? undefined,
        }),
        this.usageAnalyticsService.getUsageTimeSeries(periodParams),
      ]);

    const resolvedUsageByUser = await this.resolveBreakdownKeys(
      usageByUser,
      (ids) => this.resolveUserNames(ids, workspace.id),
    );

    const resolvedUsageByResource = await this.resolveBreakdownKeys(
      usageByResource,
      (ids) => this.resolveResourceNames(ids, workspace.id),
    );

    const result: UsageAnalyticsDTO = {
      usageByUser: resolvedUsageByUser,
      usageByResource: resolvedUsageByResource,
      usageByOperationType,
      timeSeries,
      periodStart,
      periodEnd,
    };

    if (input?.userWorkspaceId) {
      const userWorkspace = await this.userWorkspaceRepository.findOne({
        where: { id: input.userWorkspaceId, workspaceId: workspace.id },
        select: { id: true },
      });

      if (isDefined(userWorkspace)) {
        const dailyUsage =
          await this.usageAnalyticsService.getUsageByUserTimeSeries({
            ...periodParams,
            userWorkspaceId: input.userWorkspaceId,
          });

        result.userDailyUsage = {
          userWorkspaceId: input.userWorkspaceId,
          dailyUsage,
        };
      }
    }

    return result;
  }

  @Mutation(() => BillingUpdateDTO)
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

  private async getDefaultAnalyticsPeriod(
    workspaceId: string,
  ): Promise<{ defaultPeriodStart: Date; defaultPeriodEnd: Date }> {
    if (this.billingService.isBillingEnabled()) {
      const subscription =
        await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
          { workspaceId },
        );

      return {
        defaultPeriodStart: subscription.currentPeriodStart,
        defaultPeriodEnd: subscription.currentPeriodEnd,
      };
    }

    const defaultPeriodEnd = new Date();
    const defaultPeriodStart = new Date();

    defaultPeriodStart.setDate(defaultPeriodStart.getDate() - 30);

    return { defaultPeriodStart, defaultPeriodEnd };
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
  }

  private async resolveBreakdownKeys(
    items: UsageBreakdownItem[],
    resolveNames: (ids: string[]) => Promise<Map<string, string>>,
  ): Promise<UsageBreakdownItem[]> {
    if (items.length === 0) {
      return items;
    }

    const ids = items.map((item) => item.key);
    const nameMap = await resolveNames(ids);

    return items.map((item) => ({
      ...item,
      label: nameMap.get(item.key),
    }));
  }

  private async resolveUserNames(
    userWorkspaceIds: string[],
    workspaceId: string,
  ): Promise<Map<string, string>> {
    const nameMap = new Map<string, string>();

    if (userWorkspaceIds.length === 0) {
      return nameMap;
    }

    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: { id: In(userWorkspaceIds), workspaceId },
      relations: ['user'],
      select: {
        id: true,
        user: { firstName: true, lastName: true, email: true },
      },
    });

    for (const userWorkspace of userWorkspaces) {
      if (!isDefined(userWorkspace.user)) {
        continue;
      }

      const { firstName, lastName, email } = userWorkspace.user;
      const fullName = `${firstName} ${lastName}`.trim();

      nameMap.set(userWorkspace.id, fullName || email);
    }

    return nameMap;
  }

  private async resolveResourceNames(
    resourceIds: string[],
    workspaceId: string,
  ): Promise<Map<string, string>> {
    const nameMap = new Map<string, string>();

    if (resourceIds.length === 0) {
      return nameMap;
    }

    const agents = await this.agentRepository.find({
      where: { id: In(resourceIds), workspaceId },
      select: { id: true, label: true },
    });

    for (const agent of agents) {
      nameMap.set(agent.id, agent.label);
    }

    return nameMap;
  }
}
