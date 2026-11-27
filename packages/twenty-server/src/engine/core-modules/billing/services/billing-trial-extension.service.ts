/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import type Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BILLING_SUBSCRIPTION_STATE_LOCK_OPTIONS } from 'src/engine/core-modules/billing/constants/billing-subscription-state-lock-options.constant';
import { type BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingArrangementLabel } from 'src/engine/core-modules/billing/enums/billing-arrangement-label.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingArrangementService } from 'src/engine/core-modules/billing/services/billing-arrangement.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { buildBillingSubscriptionStateLockKey } from 'src/engine/core-modules/billing/utils/build-billing-subscription-state-lock-key.util';
import { buildTrialEndSchedulePhases } from 'src/engine/core-modules/billing/utils/build-trial-end-schedule-phases.util';
import { getTrialExtensionSyncAction } from 'src/engine/core-modules/billing/utils/get-trial-extension-sync-action.util';
import { isBillingArrangementActive } from 'src/engine/core-modules/billing/utils/is-billing-arrangement-active.util';
import { isSendInvoiceSubscription } from 'src/engine/core-modules/billing/utils/is-send-invoice-subscription.util';
import { toPhaseUpdateParams } from 'src/engine/core-modules/billing/utils/to-phase-update-params.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';

@Injectable()
export class BillingTrialExtensionService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly billingArrangementService: BillingArrangementService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly stripeCustomerService: StripeCustomerService,
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    private readonly stripeSubscriptionScheduleService: StripeSubscriptionScheduleService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async extendTrial({
    workspaceId,
    trialEndsAt,
    label,
    comment,
    grantedByUserId,
  }: {
    workspaceId: string;
    trialEndsAt: Date;
    label: BillingArrangementLabel;
    comment: string | null;
    grantedByUserId: string;
  }): Promise<BillingArrangementEntity> {
    const trialEnd = Math.floor(trialEndsAt.getTime() / 1000);
    const endsAt = new Date(trialEnd * 1000);

    if (endsAt <= new Date()) {
      throw new BillingException(
        `Trial end ${endsAt.toISOString()} for workspace ${workspaceId} is not in the future`,
        BillingExceptionCode.BILLING_ARRANGEMENT_INVALID,
      );
    }

    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId },
      );

    return await this.cacheLockService.withLock(
      async () => {
        const {
          subscription: stripeSubscription,
          schedule,
          currentPhase,
          nextPhase,
        } = await this.stripeSubscriptionScheduleService.loadSubscriptionSchedule(
          subscription.stripeSubscriptionId,
        );

        if (stripeSubscription.status !== 'trialing') {
          throw new BillingException(
            `Subscription ${subscription.stripeSubscriptionId} of workspace ${workspaceId} is not trialing`,
            BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_IN_TRIAL_PERIOD,
          );
        }

        const now = new Date();
        const activeTrialExtension = await this.findActiveTrialExtension({
          workspaceId,
          now,
        });

        await this.moveStripeTrialEnd({
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          schedule,
          currentPhase,
          nextPhase,
          trialEnd,
        });

        const trialExtension = await this.replaceActiveTrialExtension({
          workspaceId,
          activeTrialExtension,
          now,
          endsAt,
          label,
          comment,
          actorUserId: grantedByUserId,
        });

        await this.billingSubscriptionService.syncSubscriptionToDatabase({
          workspaceId,
          stripeSubscriptionId: subscription.stripeSubscriptionId,
        });

        return trialExtension;
      },
      buildBillingSubscriptionStateLockKey(subscription.stripeCustomerId),
      BILLING_SUBSCRIPTION_STATE_LOCK_OPTIONS,
    );
  }

  async revokeTrialExtension({
    workspaceId,
    arrangementId,
    revokedByUserId,
  }: {
    workspaceId: string;
    arrangementId: string;
    revokedByUserId: string;
  }): Promise<BillingArrangementEntity> {
    const trialExtension =
      await this.billingArrangementService.findArrangementOrThrow({
        workspaceId,
        arrangementId,
      });

    if (
      !isBillingArrangementActive({
        arrangement: trialExtension,
        now: new Date(),
      })
    ) {
      return trialExtension;
    }

    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId },
      );

    return await this.cacheLockService.withLock(
      async () => {
        const now = new Date();
        const activeTrialExtension = await this.findActiveTrialExtension({
          workspaceId,
          now,
        });

        if (activeTrialExtension?.id !== arrangementId) {
          return await this.billingArrangementService.findArrangementOrThrow({
            workspaceId,
            arrangementId,
          });
        }

        const {
          subscription: stripeSubscription,
          schedule,
          currentPhase,
          nextPhase,
        } = await this.stripeSubscriptionScheduleService.loadSubscriptionSchedule(
          subscription.stripeSubscriptionId,
        );

        if (stripeSubscription.status === 'trialing') {
          const isPaymentMethodRequired =
            !isSendInvoiceSubscription(subscription);
          const hasPaymentMethod =
            isPaymentMethodRequired &&
            (await this.stripeCustomerService.ensureDefaultPaymentMethod(
              subscription.stripeCustomerId,
            ));

          await this.moveStripeTrialEnd({
            stripeSubscriptionId: subscription.stripeSubscriptionId,
            schedule,
            currentPhase,
            nextPhase,
            trialEnd: 'now',
            paymentBehavior:
              isPaymentMethodRequired && !hasPaymentMethod
                ? 'default_incomplete'
                : undefined,
          });
        }

        const endedTrialExtension =
          await this.billingArrangementService.endArrangement({
            arrangement: activeTrialExtension,
            revokedByUserId,
            now,
          });

        await this.billingSubscriptionService.syncSubscriptionToDatabase({
          workspaceId,
          stripeSubscriptionId: subscription.stripeSubscriptionId,
        });

        return endedTrialExtension;
      },
      buildBillingSubscriptionStateLockKey(subscription.stripeCustomerId),
      BILLING_SUBSCRIPTION_STATE_LOCK_OPTIONS,
    );
  }

  async syncStripeTrialEnd({
    workspaceId,
    previousTrialEnd,
    status,
    trialEnd,
  }: {
    workspaceId: string;
    previousTrialEnd: Date | null;
    status: SubscriptionStatus;
    trialEnd: Date | null;
  }): Promise<void> {
    const now = new Date();
    const activeTrialExtension = await this.findActiveTrialExtension({
      workspaceId,
      now,
    });

    const action = getTrialExtensionSyncAction({
      activeTrialExtensionEndsAt: activeTrialExtension?.endsAt ?? null,
      previousTrialEnd,
      isTrialing: status === SubscriptionStatus.Trialing,
      trialEnd,
    });

    switch (action.type) {
      case 'NONE':
        return;
      case 'END':
        if (isDefined(activeTrialExtension)) {
          await this.billingArrangementService.endArrangement({
            arrangement: activeTrialExtension,
            revokedByUserId: null,
            now,
          });
        }

        return;
      case 'START':
        await this.replaceActiveTrialExtension({
          workspaceId,
          activeTrialExtension,
          now,
          endsAt: action.endsAt,
          label: BillingArrangementLabel.OTHER,
          comment: null,
          actorUserId: null,
        });

        return;
      default:
        assertUnreachable(action);
    }
  }

  private async moveStripeTrialEnd({
    stripeSubscriptionId,
    schedule,
    currentPhase,
    nextPhase,
    trialEnd,
    paymentBehavior,
  }: {
    stripeSubscriptionId: string;
    schedule: Stripe.SubscriptionSchedule | undefined;
    currentPhase: Stripe.SubscriptionSchedule.Phase | undefined;
    nextPhase: Stripe.SubscriptionSchedule.Phase | undefined;
    trialEnd: number | 'now';
    paymentBehavior?: Stripe.SubscriptionUpdateParams.PaymentBehavior;
  }): Promise<void> {
    if (
      isDefined(schedule) &&
      isDefined(currentPhase) &&
      isDefined(nextPhase)
    ) {
      await this.stripeSubscriptionScheduleService.updateSchedule(schedule.id, {
        phases: buildTrialEndSchedulePhases({
          currentPhase: toPhaseUpdateParams(currentPhase),
          nextPhase: toPhaseUpdateParams(nextPhase),
          trialEnd,
        }),
      });

      return;
    }

    await this.stripeSubscriptionService.updateSubscription(
      stripeSubscriptionId,
      trialEnd === 'now'
        ? { trial_end: 'now', payment_behavior: paymentBehavior }
        : { trial_end: trialEnd, proration_behavior: 'none' },
    );
  }

  private async findActiveTrialExtension({
    workspaceId,
    now,
  }: {
    workspaceId: string;
    now: Date;
  }): Promise<BillingArrangementEntity | undefined> {
    const trialExtensions =
      await this.billingArrangementService.findArrangementsByTypes({
        workspaceId,
        types: [BillingArrangementType.TRIAL_EXTENSION],
      });

    return trialExtensions.find((arrangement) =>
      isBillingArrangementActive({ arrangement, now }),
    );
  }

  private async replaceActiveTrialExtension({
    workspaceId,
    activeTrialExtension,
    now,
    endsAt,
    label,
    comment,
    actorUserId,
  }: {
    workspaceId: string;
    activeTrialExtension: BillingArrangementEntity | undefined;
    now: Date;
    endsAt: Date;
    label: BillingArrangementLabel;
    comment: string | null;
    actorUserId: string | null;
  }): Promise<BillingArrangementEntity> {
    return await this.dataSource.transaction(async (entityManager) => {
      if (isDefined(activeTrialExtension)) {
        await this.billingArrangementService.endArrangement({
          arrangement: activeTrialExtension,
          revokedByUserId: actorUserId,
          now,
          entityManager,
        });
      }

      return await this.billingArrangementService.insertArrangement({
        workspaceId,
        arrangement: {
          type: BillingArrangementType.TRIAL_EXTENSION,
          label,
          comment,
          seats: null,
          seatCapMode: null,
          stripePriceId: null,
          stripeDiscountId: null,
          creditAllowanceMicro: null,
          stripeCreditNoteId: null,
          creditGrantId: null,
          usageLimitId: null,
          startsAt: now,
          endsAt,
        },
        grantedByUserId: actorUserId,
        entityManager,
      });
    });
  }
}
