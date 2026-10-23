/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { getSubscriptionStatus } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-subscription.util';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
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
import { isSamePhaseSignature } from 'src/engine/core-modules/billing/utils/is-same-phase-signature.util';
import { isSendInvoiceSubscription } from 'src/engine/core-modules/billing/utils/is-send-invoice-subscription.util';
import { toPhaseUpdateParams } from 'src/engine/core-modules/billing/utils/to-phase-update-params.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class BillingTrialService {
  protected readonly logger = new Logger(BillingTrialService.name);

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

    const { subscription, schedule, currentPhase, nextPhase } =
      await this.stripeSubscriptionScheduleService.loadSubscriptionSchedule(
        stripeSubscriptionId,
      );

    if (
      subscription.status !== 'trialing' ||
      !isDefined(subscription.trial_end)
    ) {
      return;
    }

    if (
      isDefined(currentPhase) &&
      isDefined(nextPhase) &&
      !isSamePhaseSignature(
        toPhaseUpdateParams(currentPhase),
        toPhaseUpdateParams(nextPhase),
      )
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

    if (
      isDefined(schedule) &&
      isDefined(currentPhase) &&
      isDefined(nextPhase)
    ) {
      await this.billingSubscriptionUpdateService.runSubscriptionScheduleUpdate(
        {
          stripeScheduleId: schedule.id,
          toUpdateNextPrices,
          toUpdateCurrentPrices: undefined,
          currentPhase: toPhaseUpdateParams(currentPhase),
          nextPhase: toPhaseUpdateParams(nextPhase),
          subscriptionCurrentPeriodEnd: subscription.trial_end,
        },
      );

      return;
    }

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

    const updatedSubscription =
      await this.endTrialOnStripe(billingSubscription);

    await this.billingSubscriptionService.syncSubscriptionToDatabase(
      billingSubscription.workspaceId,
      updatedSubscription.id,
    );

    return {
      status: getSubscriptionStatus(updatedSubscription.status),
      hasPaymentMethod: true,
    };
  }

  private async endTrialOnStripe(
    billingSubscription: BillingSubscriptionEntity,
  ): Promise<Stripe.Subscription> {
    const { schedule, nextPhase } =
      await this.stripeSubscriptionScheduleService.loadSubscriptionSchedule(
        billingSubscription.stripeSubscriptionId,
      );

    if (isDefined(schedule) && isDefined(nextPhase)) {
      return await this.startNextPhaseNow({
        billingSubscription,
        stripeScheduleId: schedule.id,
        nextPhase,
      });
    }

    return await this.stripeSubscriptionService.updateSubscription(
      billingSubscription.stripeSubscriptionId,
      {
        trial_end: 'now',
        cancel_at_period_end: false,
      },
    );
  }

  private async startNextPhaseNow({
    billingSubscription,
    stripeScheduleId,
    nextPhase,
  }: {
    billingSubscription: BillingSubscriptionEntity;
    stripeScheduleId: string;
    nextPhase: Stripe.SubscriptionSchedule.Phase;
  }): Promise<Stripe.Subscription> {
    const nextPhasePrices =
      await this.billingSubscriptionUpdateService.getSubscriptionPricesFromItems(
        nextPhase.items,
      );

    const nextPlanKey = await this.getPlanKeyByPriceIdOrThrow(
      nextPhasePrices.baseProductPriceId,
    );

    await this.stripeSubscriptionScheduleService.releaseSubscriptionSchedule(
      stripeScheduleId,
    );

    try {
      return await this.stripeSubscriptionService.updateSubscription(
        billingSubscription.stripeSubscriptionId,
        {
          items: buildSubscriptionItemsUpdate({
            billingSubscriptionItems:
              billingSubscription.billingSubscriptionItems,
            toUpdatePrices: nextPhasePrices,
          }),
          trial_end: 'now',
          cancel_at_period_end: false,
          proration_behavior: 'none',
          metadata: { plan: nextPlanKey },
        },
      );
    } catch (error) {
      await this.billingSubscriptionUpdateService
        .createScheduleWithNextPhase({
          stripeSubscriptionId: billingSubscription.stripeSubscriptionId,
          toUpdateNextPrices: nextPhasePrices,
          subscriptionCurrentPeriodEnd: nextPhase.start_date,
        })
        .catch((restoreError) =>
          this.logger.error(
            `Failed to restore the subscription schedule of ${billingSubscription.stripeSubscriptionId}: ${restoreError}`,
          ),
        );

      throw error;
    }
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
