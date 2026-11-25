/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import {
  assertUnreachable,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { DataSource, Repository } from 'typeorm';

import type Stripe from 'stripe';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BILLING_SUBSCRIPTION_STATE_LOCK_OPTIONS } from 'src/engine/core-modules/billing/constants/billing-subscription-state-lock-options.constant';
import { type BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingArrangementLabel } from 'src/engine/core-modules/billing/enums/billing-arrangement-label.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingArrangementService } from 'src/engine/core-modules/billing/services/billing-arrangement.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeCouponService } from 'src/engine/core-modules/billing/stripe/services/stripe-coupon.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { type StripeCouponDiscount } from 'src/engine/core-modules/billing/types/stripe-coupon-discount.type';
import { addLiveDiscountsToSchedulePhases } from 'src/engine/core-modules/billing/utils/add-live-discounts-to-schedule-phases.util';
import { buildBillingSubscriptionStateLockKey } from 'src/engine/core-modules/billing/utils/build-billing-subscription-state-lock-key.util';
import { getBaseProductSubscriptionItemOrThrow } from 'src/engine/core-modules/billing/utils/get-base-product-subscription-item-or-throw.util';
import { getDiscountArrangementStartsAt } from 'src/engine/core-modules/billing/utils/get-discount-arrangement-starts-at.util';
import { getDiscountSyncAction } from 'src/engine/core-modules/billing/utils/get-discount-sync-action.util';
import { getExpandedDiscounts } from 'src/engine/core-modules/billing/utils/get-expanded-discounts.util';
import { isBillingArrangementActive } from 'src/engine/core-modules/billing/utils/is-billing-arrangement-active.util';
import { isSeatOnlyCoupon } from 'src/engine/core-modules/billing/utils/is-seat-only-coupon.util';
import { toPhaseUpdateParams } from 'src/engine/core-modules/billing/utils/to-phase-update-params.util';
import { toStripeCouponDiscount } from 'src/engine/core-modules/billing/utils/to-stripe-coupon-discount.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';

@Injectable()
export class BillingDiscountService {
  private readonly logger = new Logger(BillingDiscountService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(BillingProductEntity)
    private readonly billingProductRepository: Repository<BillingProductEntity>,
    private readonly billingArrangementService: BillingArrangementService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly stripeCouponService: StripeCouponService,
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    private readonly stripeSubscriptionScheduleService: StripeSubscriptionScheduleService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async findSeatOnlyCoupons(): Promise<Stripe.Coupon[]> {
    const [coupons, baseProductStripeIds] = await Promise.all([
      this.stripeCouponService.listCoupons(),
      this.findBaseProductStripeIds(),
    ]);

    return coupons.filter((coupon) =>
      isSeatOnlyCoupon({ coupon, baseProductStripeIds }),
    );
  }

  async findCouponsById(): Promise<Map<string, Stripe.Coupon>> {
    const coupons = await this.stripeCouponService.listCoupons();

    return new Map(coupons.map((coupon) => [coupon.id, coupon]));
  }

  async applyDiscount({
    workspaceId,
    stripeCouponId,
    label,
    comment,
    grantedByUserId,
  }: {
    workspaceId: string;
    stripeCouponId: string;
    label: BillingArrangementLabel;
    comment: string | null;
    grantedByUserId: string;
  }): Promise<BillingArrangementEntity> {
    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId },
      );

    const [coupon, baseProductStripeIds] = await Promise.all([
      this.stripeCouponService.getCoupon(stripeCouponId),
      this.findBaseProductStripeIds(),
    ]);

    const planProductStripeId =
      getBaseProductSubscriptionItemOrThrow(subscription).billingProduct
        ?.stripeProductId;

    if (
      !isSeatOnlyCoupon({ coupon, baseProductStripeIds }) ||
      !isDefined(planProductStripeId) ||
      !coupon.applies_to?.products.includes(planProductStripeId)
    ) {
      throw new BillingException(
        `Coupon ${stripeCouponId} does not discount the seats of the plan of workspace ${workspaceId}`,
        BillingExceptionCode.BILLING_ARRANGEMENT_INVALID,
      );
    }

    return await this.cacheLockService.withLock(
      async () => {
        const { subscription: stripeSubscription } =
          await this.stripeSubscriptionScheduleService.loadSubscriptionSchedule(
            subscription.stripeSubscriptionId,
          );

        if (isNonEmptyArray(stripeSubscription.discounts)) {
          throw new BillingException(
            `Subscription ${subscription.stripeSubscriptionId} of workspace ${workspaceId} already has a discount`,
            BillingExceptionCode.BILLING_ARRANGEMENT_INVALID,
          );
        }

        const updatedStripeSubscription =
          await this.stripeSubscriptionService.updateSubscription(
            subscription.stripeSubscriptionId,
            { discounts: [{ coupon: stripeCouponId }], expand: ['discounts'] },
          );

        const discount = this.findLiveCouponDiscounts(
          updatedStripeSubscription,
        ).find(
          (liveDiscount) => liveDiscount.stripeCouponId === stripeCouponId,
        );

        if (!isDefined(discount)) {
          throw new BillingException(
            `Coupon ${stripeCouponId} was not applied to subscription ${subscription.stripeSubscriptionId}`,
            BillingExceptionCode.BILLING_ARRANGEMENT_INVALID,
          );
        }

        await this.alignScheduleDiscounts(subscription.stripeSubscriptionId);

        return await this.replaceActiveDiscount({
          workspaceId,
          discount,
          label,
          comment,
          actorUserId: grantedByUserId,
        });
      },
      buildBillingSubscriptionStateLockKey(subscription.stripeCustomerId),
      BILLING_SUBSCRIPTION_STATE_LOCK_OPTIONS,
    );
  }

  async revokeDiscount({
    workspaceId,
    arrangementId,
    revokedByUserId,
  }: {
    workspaceId: string;
    arrangementId: string;
    revokedByUserId: string;
  }): Promise<BillingArrangementEntity> {
    const discountArrangement =
      await this.billingArrangementService.findArrangementOrThrow({
        workspaceId,
        arrangementId,
      });

    if (
      !isBillingArrangementActive({
        arrangement: discountArrangement,
        now: new Date(),
      })
    ) {
      return discountArrangement;
    }

    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscription({
        workspaceId,
      });

    if (!isDefined(subscription)) {
      return await this.billingArrangementService.endArrangement({
        arrangement: discountArrangement,
        revokedByUserId,
      });
    }

    return await this.cacheLockService.withLock(
      async () => {
        const now = new Date();
        const activeDiscount = await this.findActiveDiscount({
          workspaceId,
          now,
        });

        if (activeDiscount?.id !== arrangementId) {
          return await this.billingArrangementService.findArrangementOrThrow({
            workspaceId,
            arrangementId,
          });
        }

        const { subscription: stripeSubscription } =
          await this.stripeSubscriptionScheduleService.loadSubscriptionSchedule(
            subscription.stripeSubscriptionId,
          );

        const subscriptionDiscounts = getExpandedDiscounts(
          stripeSubscription.discounts,
        );

        if (
          subscriptionDiscounts.some(
            ({ id }) => id === activeDiscount.stripeDiscountId,
          )
        ) {
          const remainingDiscounts = subscriptionDiscounts.filter(
            ({ id }) => id !== activeDiscount.stripeDiscountId,
          );

          await this.stripeSubscriptionService.updateSubscription(
            subscription.stripeSubscriptionId,
            {
              discounts: isNonEmptyArray(remainingDiscounts)
                ? remainingDiscounts.map(({ id }) => ({ discount: id }))
                : '',
            },
          );

          await this.alignScheduleDiscounts(subscription.stripeSubscriptionId);
        }

        return await this.billingArrangementService.endArrangement({
          arrangement: activeDiscount,
          revokedByUserId,
          now,
        });
      },
      buildBillingSubscriptionStateLockKey(subscription.stripeCustomerId),
      BILLING_SUBSCRIPTION_STATE_LOCK_OPTIONS,
    );
  }

  async syncStripeDiscounts({
    workspaceId,
    subscription,
    isSubscriptionLive,
  }: {
    workspaceId: string;
    subscription: Pick<Stripe.Subscription, 'discounts'>;
    isSubscriptionLive: boolean;
  }): Promise<void> {
    const now = new Date();
    const discountArrangements =
      await this.billingArrangementService.findArrangementsByTypes({
        workspaceId,
        types: [BillingArrangementType.DISCOUNT],
      });

    const activeDiscount = discountArrangements.find((arrangement) =>
      isBillingArrangementActive({ arrangement, now }),
    );

    const liveDiscounts = isSubscriptionLive
      ? this.findLiveCouponDiscounts(subscription, now)
      : [];

    if (liveDiscounts.length > 1) {
      this.logger.warn(
        `Workspace ${workspaceId} holds ${liveDiscounts.length} Stripe discounts, only one is recorded`,
      );
    }

    const action = getDiscountSyncAction({
      activeStripeDiscountId: activeDiscount?.stripeDiscountId ?? null,
      recordedStripeDiscountIds: new Set(
        discountArrangements
          .map(({ stripeDiscountId }) => stripeDiscountId)
          .filter(isDefined),
      ),
      liveDiscounts,
    });

    switch (action.type) {
      case 'NONE':
        return;
      case 'END':
        if (isDefined(activeDiscount)) {
          await this.billingArrangementService.endArrangement({
            arrangement: activeDiscount,
            revokedByUserId: null,
            now,
          });
        }

        return;
      case 'START':
        await this.replaceActiveDiscount({
          workspaceId,
          discount: action.discount,
          label: BillingArrangementLabel.OTHER,
          comment: null,
          actorUserId: null,
        });

        return;
      default:
        assertUnreachable(action);
    }
  }

  private findLiveCouponDiscounts(
    subscription: Pick<Stripe.Subscription, 'discounts'>,
    now: Date = new Date(),
  ): StripeCouponDiscount[] {
    return getExpandedDiscounts(subscription.discounts)
      .map(toStripeCouponDiscount)
      .filter(isDefined)
      .filter(({ endsAt }) => !isDefined(endsAt) || endsAt > now);
  }

  private async findBaseProductStripeIds(): Promise<Set<string>> {
    const products = await this.billingProductRepository.find();

    return new Set(
      products
        .filter(
          ({ metadata }) =>
            metadata?.productKey === BillingProductKey.BASE_PRODUCT,
        )
        .map(({ stripeProductId }) => stripeProductId),
    );
  }

  private async findActiveDiscount({
    workspaceId,
    now,
  }: {
    workspaceId: string;
    now: Date;
  }): Promise<BillingArrangementEntity | undefined> {
    const discountArrangements =
      await this.billingArrangementService.findArrangementsByTypes({
        workspaceId,
        types: [BillingArrangementType.DISCOUNT],
      });

    return discountArrangements.find((arrangement) =>
      isBillingArrangementActive({ arrangement, now }),
    );
  }

  private async alignScheduleDiscounts(stripeSubscriptionId: string) {
    const { subscription, schedule, currentPhase, nextPhase } =
      await this.stripeSubscriptionScheduleService.loadSubscriptionSchedule(
        stripeSubscriptionId,
      );

    if (
      !isDefined(schedule) ||
      !isDefined(currentPhase) ||
      !isDefined(nextPhase)
    ) {
      return;
    }

    await this.stripeSubscriptionScheduleService.updateSchedule(schedule.id, {
      phases: addLiveDiscountsToSchedulePhases({
        phases: [
          toPhaseUpdateParams(currentPhase),
          toPhaseUpdateParams(nextPhase),
        ],
        subscriptionDiscounts: getExpandedDiscounts(subscription.discounts),
      }),
    });
  }

  private async replaceActiveDiscount({
    workspaceId,
    discount,
    label,
    comment,
    actorUserId,
  }: {
    workspaceId: string;
    discount: StripeCouponDiscount;
    label: BillingArrangementLabel;
    comment: string | null;
    actorUserId: string | null;
  }): Promise<BillingArrangementEntity> {
    const now = new Date();
    const discountArrangements =
      await this.billingArrangementService.findArrangementsByTypes({
        workspaceId,
        types: [BillingArrangementType.DISCOUNT],
      });

    const activeDiscount = discountArrangements.find((arrangement) =>
      isBillingArrangementActive({ arrangement, now }),
    );

    return await this.dataSource.transaction(async (entityManager) => {
      if (isDefined(activeDiscount)) {
        await this.billingArrangementService.endArrangement({
          arrangement: activeDiscount,
          revokedByUserId: actorUserId,
          now,
          entityManager,
        });
      }

      return await this.billingArrangementService.insertArrangement({
        workspaceId,
        arrangement: {
          type: BillingArrangementType.DISCOUNT,
          label,
          comment,
          seats: null,
          seatCapMode: null,
          stripePriceId: null,
          stripeDiscountId: discount.stripeDiscountId,
          stripeCouponId: discount.stripeCouponId,
          creditAllowanceMicro: null,
          stripeCreditNoteId: null,
          creditGrantId: null,
          usageLimitId: null,
          startsAt: getDiscountArrangementStartsAt({
            discountStartsAt: discount.startsAt,
            discountArrangements: discountArrangements.map((arrangement) =>
              arrangement.id === activeDiscount?.id
                ? { ...arrangement, revokedAt: now }
                : arrangement,
            ),
          }),
          endsAt: discount.endsAt,
        },
        grantedByUserId: actorUserId,
        entityManager,
      });
    });
  }
}
