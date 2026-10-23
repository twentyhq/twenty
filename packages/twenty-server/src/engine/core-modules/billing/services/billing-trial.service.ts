/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { getSubscriptionStatus } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-subscription.util';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingSubscriptionUpdateService } from 'src/engine/core-modules/billing/services/billing-subscription-update.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { SubscriptionUpdateType } from 'src/engine/core-modules/billing/types/billing-subscription-update.type';
import { buildSubscriptionItemsUpdate } from 'src/engine/core-modules/billing/utils/build-subscription-items-update.util';
import { getReverseTrialPlanKeys } from 'src/engine/core-modules/billing/utils/get-reverse-trial-plan-keys.util';
import { isSendInvoiceSubscription } from 'src/engine/core-modules/billing/utils/is-send-invoice-subscription.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class BillingTrialService {
  constructor(
    private readonly billingSubscriptionUpdateService: BillingSubscriptionUpdateService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    private readonly stripeSubscriptionScheduleService: StripeSubscriptionScheduleService,
    private readonly stripeCustomerService: StripeCustomerService,
    @InjectRepository(BillingPriceEntity)
    private readonly billingPriceRepository: Repository<BillingPriceEntity>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async scheduleReverseTrialDowngrade(
    stripeSubscriptionId: string,
  ): Promise<void> {
    const reverseTrialPlanKeys = getReverseTrialPlanKeys(
      this.twentyConfigService.get('BILLING_PLANS'),
    );

    if (!isDefined(reverseTrialPlanKeys)) {
      return;
    }

    const subscription =
      await this.stripeSubscriptionScheduleService.getSubscriptionWithSchedule(
        stripeSubscriptionId,
      );

    if (
      subscription.status !== 'trialing' ||
      !isDefined(subscription.trial_end) ||
      isDefined(subscription.schedule)
    ) {
      return;
    }

    const currentPrices =
      await this.billingSubscriptionUpdateService.getSubscriptionPricesFromItems(
        subscription.items.data,
      );

    const currentPlanKey = await this.getPlanKeyByPriceIdOrThrow(
      currentPrices.baseProductPriceId,
    );

    if (currentPlanKey !== reverseTrialPlanKeys.trialPlanKey) {
      return;
    }

    const toUpdateNextPrices =
      await this.billingSubscriptionUpdateService.computeSubscriptionPricesUpdate(
        {
          type: SubscriptionUpdateType.PLAN,
          newPlan: reverseTrialPlanKeys.downgradePlanKey,
        },
        currentPrices,
      );

    await this.billingSubscriptionUpdateService.createScheduleWithNextPhase({
      stripeSubscriptionId,
      toUpdateNextPrices,
      subscriptionCurrentPeriodEnd: subscription.trial_end,
    });
  }

  async endTrialPeriod(workspace: WorkspaceEntity) {
    const billingSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId: workspace.id },
      );

    if (billingSubscription.status !== SubscriptionStatus.Trialing) {
      throw new BillingException(
        'Billing subscription is not in trial period',
        BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_IN_TRIAL_PERIOD,
      );
    }

    if (!isSendInvoiceSubscription(billingSubscription)) {
      const hasPaymentMethod =
        await this.stripeCustomerService.hasPaymentMethod(
          billingSubscription.stripeCustomerId,
        );

      if (!hasPaymentMethod) {
        return {
          hasPaymentMethod: false,
          status: undefined,
          stripeCustomerId: billingSubscription.stripeCustomerId,
        };
      }

      await this.stripeCustomerService.ensureDefaultPaymentMethod(
        billingSubscription.stripeCustomerId,
      );
    }

    const { schedule, nextPhase } =
      await this.stripeSubscriptionScheduleService.loadSubscriptionSchedule(
        billingSubscription.stripeSubscriptionId,
      );

    if (isDefined(schedule) && isDefined(nextPhase)) {
      const nextPhasePrices =
        await this.billingSubscriptionUpdateService.getSubscriptionPricesFromItems(
          nextPhase.items,
        );

      const nextPlanKey = await this.getPlanKeyByPriceIdOrThrow(
        nextPhasePrices.baseProductPriceId,
      );

      await this.stripeSubscriptionService.updateSubscription(
        billingSubscription.stripeSubscriptionId,
        {
          items: buildSubscriptionItemsUpdate({
            billingSubscriptionItems:
              billingSubscription.billingSubscriptionItems,
            toUpdatePrices: nextPhasePrices,
          }),
          proration_behavior: 'none',
          metadata: { plan: nextPlanKey },
        },
      );

      await this.stripeSubscriptionScheduleService.releaseSubscriptionSchedule(
        schedule.id,
      );
    }

    const updatedSubscription =
      await this.stripeSubscriptionService.updateSubscription(
        billingSubscription.stripeSubscriptionId,
        {
          trial_end: 'now',
          cancel_at_period_end: false,
        },
      );

    await this.billingSubscriptionService.syncSubscriptionToDatabase(
      billingSubscription.workspaceId,
      updatedSubscription.id,
    );

    return {
      status: getSubscriptionStatus(updatedSubscription.status),
      hasPaymentMethod: true,
    };
  }

  private async getPlanKeyByPriceIdOrThrow(
    stripePriceId: string,
  ): Promise<BillingPlanKey> {
    const billingPrice = await this.billingPriceRepository.findOneOrFail({
      where: { stripePriceId },
      relations: ['billingProduct'],
    });

    const planKey = billingPrice.billingProduct?.metadata.planKey;

    assertIsDefinedOrThrow(planKey);

    return planKey;
  }
}
