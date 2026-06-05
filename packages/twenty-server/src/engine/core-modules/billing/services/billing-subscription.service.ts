/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { differenceInDays } from 'date-fns';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { Not, type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { transformStripeSubscriptionEventToDatabaseCustomer } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-customer.util';
import { transformStripeSubscriptionEventToDatabaseSubscriptionItem } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-subscription-item.util';
import {
  getSubscriptionStatus,
  transformStripeSubscriptionEventToDatabaseSubscription,
} from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-subscription.util';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingEntitlementDTO } from 'src/engine/core-modules/billing/dtos/billing-entitlement.dto';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingEntitlementEntity } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingPriceService } from 'src/engine/core-modules/billing/services/billing-price.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { getPlanKeyFromSubscription } from 'src/engine/core-modules/billing/utils/get-plan-key-from-subscription.util';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
@Injectable()
export class BillingSubscriptionService {
  protected readonly logger = new Logger(BillingSubscriptionService.name);

  constructor(
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    private readonly billingPriceService: BillingPriceService,
    private readonly billingPlanService: BillingPlanService,
    @InjectWorkspaceScopedRepository(BillingEntitlementEntity)
    private readonly billingEntitlementRepository: WorkspaceScopedRepository<BillingEntitlementEntity>,
    @InjectWorkspaceScopedRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: WorkspaceScopedRepository<BillingSubscriptionEntity>,
    // Stripe webhooks resolve by stripeCustomerId before any workspaceId
    // is known. Used only when the criteria has no workspaceId.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepositoryUnscoped: Repository<BillingSubscriptionEntity>,
    private readonly stripeCustomerService: StripeCustomerService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(BillingSubscriptionItemEntity)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItemEntity>,
    private readonly stripeSubscriptionScheduleService: StripeSubscriptionScheduleService,
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
    private readonly enterprisePlanService: EnterprisePlanService,
  ) {}

  async getBillingSubscriptions(workspaceId: string) {
    return await this.billingSubscriptionRepository.find(workspaceId);
  }

  async getCurrentBillingSubscription(criteria: {
    workspaceId?: string;
    stripeCustomerId?: string;
  }): Promise<BillingSubscriptionEntity | undefined> {
    const baseFindOptions = {
      relations: [
        'billingSubscriptionItems',
        'billingSubscriptionItems.billingProduct',
      ],
    };

    const notCanceledSubscriptions = isDefined(criteria.workspaceId)
      ? await this.billingSubscriptionRepository.find(criteria.workspaceId, {
          ...baseFindOptions,
          where: { status: Not(SubscriptionStatus.Canceled) },
        })
      : await this.billingSubscriptionRepositoryUnscoped.find({
          ...baseFindOptions,
          where: { ...criteria, status: Not(SubscriptionStatus.Canceled) },
        });

    if (notCanceledSubscriptions.length > 1) {
      throw new BillingException(
        `More than one not canceled subscription for workspace ${criteria.workspaceId}`,
        BillingExceptionCode.BILLING_TOO_MUCH_SUBSCRIPTIONS_FOUND,
      );
    }

    return notCanceledSubscriptions[0];
  }

  async getCurrentBillingSubscriptionOrThrow(criteria: {
    workspaceId?: string;
    stripeCustomerId?: string;
  }): Promise<BillingSubscriptionEntity> {
    const notCanceledSubscription =
      await this.getCurrentBillingSubscription(criteria);

    assertIsDefinedOrThrow(
      notCanceledSubscription,
      new BillingException(
        `No active subscription found for workspace ${criteria.workspaceId}`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
      ),
    );

    return notCanceledSubscription;
  }

  async getBaseProductCurrentBillingSubscriptionItemOrThrow(
    workspaceId: string,
  ) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId },
    );

    const planKey = getPlanKeyFromSubscription(billingSubscription);

    const baseProduct =
      await this.billingPlanService.getPlanBaseProduct(planKey);

    if (!baseProduct) {
      throw new BillingException(
        'Base product not found',
        BillingExceptionCode.BILLING_PRODUCT_NOT_FOUND,
      );
    }

    const stripeProductId = baseProduct.stripeProductId;

    const billingSubscriptionItem =
      billingSubscription.billingSubscriptionItems.find(
        (item) => item.stripeProductId === stripeProductId,
      );

    if (!billingSubscriptionItem) {
      throw new BillingException(
        `Cannot find billingSubscriptionItem for product ${stripeProductId} for workspace ${workspaceId}`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_NOT_FOUND,
      );
    }

    return billingSubscriptionItem;
  }

  async cancelSubscription(workspaceId: string): Promise<void> {
    const subscription = await this.getCurrentBillingSubscription({
      workspaceId,
    });

    if (isDefined(subscription)) {
      await this.stripeSubscriptionService.cancelSubscription(
        subscription.stripeSubscriptionId,
      );
    }
  }

  async assertSubscriptionCanceledOrNone(workspaceId: string): Promise<void> {
    const activeSubscription = await this.getCurrentBillingSubscription({
      workspaceId,
    });

    if (isDefined(activeSubscription)) {
      throw new BillingException(
        `Subscription for workspace ${workspaceId} is not canceled`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_CANCELED,
      );
    }
  }

  async handleUnpaidInvoices(data: Stripe.SetupIntentSucceededEvent.Data) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { stripeCustomerId: data.object.customer as string },
    );

    if (billingSubscription.status === SubscriptionStatus.Unpaid) {
      await this.stripeSubscriptionService.collectLastInvoice(
        billingSubscription.stripeSubscriptionId,
      );
    }

    return {
      handleUnpaidInvoiceStripeSubscriptionId:
        billingSubscription.stripeSubscriptionId,
    };
  }

  async getWorkspaceEntitlements(
    workspaceId: string,
  ): Promise<BillingEntitlementDTO[]> {
    const isBillingEnabled = this.twentyConfigService.get('IS_BILLING_ENABLED');
    const hasValidEnterprisePlan = this.enterprisePlanService.isValid();

    const entitlements = isBillingEnabled
      ? await this.billingEntitlementRepository.find(workspaceId)
      : [];

    const entitlementsByKey = entitlements.reduce(
      (acc, entitlement) => {
        acc[entitlement.key] = entitlement;

        return acc;
      },
      {} as Record<BillingEntitlementKey, BillingEntitlementEntity>,
    );

    return Object.values(BillingEntitlementKey).map((key) => ({
      key,
      value:
        hasValidEnterprisePlan &&
        (!isBillingEnabled || (entitlementsByKey[key]?.value ?? false)),
    }));
  }

  async getWorkspaceEntitlementByKey(
    workspaceId: string,
    key: BillingEntitlementKey,
  ): Promise<boolean> {
    const entitlement = await this.billingEntitlementRepository.findOne(
      workspaceId,
      { where: { key, value: true } },
    );

    return entitlement?.value ?? false;
  }

  async endTrialPeriod(workspace: WorkspaceEntity) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId: workspace.id },
    );

    if (billingSubscription.status !== SubscriptionStatus.Trialing) {
      throw new BillingException(
        'Billing subscription is not in trial period',
        BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_IN_TRIAL_PERIOD,
      );
    }

    const hasPaymentMethod = await this.stripeCustomerService.hasPaymentMethod(
      billingSubscription.stripeCustomerId,
    );

    if (!hasPaymentMethod) {
      return {
        hasPaymentMethod: false,
        status: undefined,
        stripeCustomerId: billingSubscription.stripeCustomerId,
      };
    }

    const updatedSubscription =
      await this.stripeSubscriptionService.updateSubscription(
        billingSubscription.stripeSubscriptionId,
        {
          trial_end: 'now',
          cancel_at_period_end: false,
        },
      );

    await this.billingSubscriptionItemRepository.update(
      { stripeSubscriptionId: updatedSubscription.id },
      { hasReachedCurrentPeriodCap: false },
    );

    return {
      status: getSubscriptionStatus(updatedSubscription.status),
      hasPaymentMethod: true,
    };
  }

  async syncSubscriptionToDatabase(
    workspaceId: string,
    stripeSubscriptionId: string,
  ) {
    const subscription =
      await this.stripeSubscriptionScheduleService.getSubscriptionWithSchedule(
        stripeSubscriptionId,
      );

    await this.billingCustomerRepository.upsert(
      workspaceId,
      transformStripeSubscriptionEventToDatabaseCustomer(workspaceId, {
        object: subscription,
      }),
      {
        conflictPaths: ['workspaceId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    await this.billingSubscriptionRepository.upsert(
      workspaceId,
      transformStripeSubscriptionEventToDatabaseSubscription(
        workspaceId,
        subscription,
      ),
      {
        conflictPaths: ['stripeSubscriptionId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    const billingSubscriptions =
      await this.billingSubscriptionRepository.find(workspaceId);

    const currentBillingSubscription = billingSubscriptions.find(
      (sub) => sub.stripeSubscriptionId === subscription.id,
    );

    if (!currentBillingSubscription) {
      throw new BillingException(
        'Billing subscription not found after creation',
        BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
      );
    }

    const billingSubscriptionItems =
      transformStripeSubscriptionEventToDatabaseSubscriptionItem(
        currentBillingSubscription.id,
        {
          object: subscription,
        },
        workspaceId,
      );

    // V2 subscriptions have no quantityless metered item; skip the stale-item cleanup in that case
    const meterBillingSubscriptionItem = billingSubscriptionItems.find(
      (item) => !isDefined(item.quantity),
    );

    if (isDefined(meterBillingSubscriptionItem)) {
      const existingBillingSubscriptionItem =
        await this.billingSubscriptionItemRepository.findOne({
          where: {
            billingSubscriptionId: currentBillingSubscription.id,
            stripeProductId: meterBillingSubscriptionItem.stripeProductId,
          },
        });

      if (
        existingBillingSubscriptionItem?.stripeSubscriptionItemId !==
        meterBillingSubscriptionItem.stripeSubscriptionItemId
      ) {
        await this.billingSubscriptionItemRepository.delete({
          billingSubscriptionId: currentBillingSubscription.id,
          stripeProductId: meterBillingSubscriptionItem.stripeProductId,
        });
      }
    }

    await this.billingSubscriptionItemRepository.upsert(
      billingSubscriptionItems,
      {
        conflictPaths: ['stripeSubscriptionItemId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    this.logger.log(
      `Subscription synced to database: ${subscription.id} for workspace: ${workspaceId}`,
    );

    return currentBillingSubscription;
  }

  getTrialPeriodFreeWorkflowCredits(
    billingSubscription: BillingSubscriptionEntity,
  ) {
    const trialDuration =
      isDefined(billingSubscription.trialEnd) &&
      isDefined(billingSubscription.trialStart)
        ? differenceInDays(
            billingSubscription.trialEnd,
            billingSubscription.trialStart,
          )
        : 0;

    const trialWithCreditCardDuration = this.twentyConfigService.get(
      'BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS',
    );

    return Number(
      this.twentyConfigService.get(
        trialDuration === trialWithCreditCardDuration
          ? 'BILLING_FREE_WORKFLOW_CREDITS_FOR_TRIAL_PERIOD_WITH_CREDIT_CARD'
          : 'BILLING_FREE_WORKFLOW_CREDITS_FOR_TRIAL_PERIOD_WITHOUT_CREDIT_CARD',
      ),
    );
  }
}
