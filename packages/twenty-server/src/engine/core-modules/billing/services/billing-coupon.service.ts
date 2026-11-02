/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import type Stripe from 'stripe';

import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingArrangementLabel } from 'src/engine/core-modules/billing/enums/billing-arrangement-label.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { type BillingArrangementDraft } from 'src/engine/core-modules/billing/types/billing-arrangement-draft.type';
import { type StripeCouponDiscount } from 'src/engine/core-modules/billing/types/stripe-coupon-discount.type';
import { buildBillingArrangementLockKey } from 'src/engine/core-modules/billing/utils/build-billing-arrangement-lock-key.util';
import { computeCouponArrangementSync } from 'src/engine/core-modules/billing/utils/compute-coupon-arrangement-sync.util';
import { findOverlappingBillingArrangement } from 'src/engine/core-modules/billing/utils/find-overlapping-billing-arrangement.util';
import { getBillingArrangementValidationErrors } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-validation-errors.util';
import { isBillingArrangementActive } from 'src/engine/core-modules/billing/utils/is-billing-arrangement-active.util';
import { toStripeCouponDiscount } from 'src/engine/core-modules/billing/utils/to-stripe-coupon-discount.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class BillingCouponService {
  private readonly logger = new Logger(BillingCouponService.name);

  constructor(
    @InjectWorkspaceScopedRepository(BillingArrangementEntity)
    private readonly billingArrangementRepository: WorkspaceScopedRepository<BillingArrangementEntity>,
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    private readonly stripeCustomerService: StripeCustomerService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async hasActiveCouponArrangement(workspaceId: string): Promise<boolean> {
    const now = new Date();
    const couponArrangements = await this.findCouponArrangements(workspaceId);

    return couponArrangements.some((arrangement) =>
      isBillingArrangementActive({ arrangement, now }),
    );
  }

  async syncCouponArrangement({
    workspaceId,
    stripeCustomerId,
  }: {
    workspaceId: string;
    stripeCustomerId: string;
  }): Promise<void> {
    const stripeCouponDiscounts =
      await this.findStripeCouponDiscounts(stripeCustomerId);

    await this.cacheLockService.withLock(
      () =>
        this.applyCouponArrangementSync({ workspaceId, stripeCouponDiscounts }),
      buildBillingArrangementLockKey(workspaceId),
    );
  }

  private async findCouponArrangements(
    workspaceId: string,
  ): Promise<BillingArrangementEntity[]> {
    return await this.billingArrangementRepository.find(workspaceId, {
      where: { type: BillingArrangementType.COUPON },
    });
  }

  private async findStripeCouponDiscounts(
    stripeCustomerId: string,
  ): Promise<StripeCouponDiscount[]> {
    const [subscriptions, customerDiscount] = await Promise.all([
      this.stripeSubscriptionService.listNotEndedSubscriptionsWithDiscounts(
        stripeCustomerId,
      ),
      this.stripeCustomerService.getCustomerDiscount(stripeCustomerId),
    ]);

    const discounts: Stripe.Discount[] = [
      ...subscriptions.flatMap(({ discounts }) =>
        discounts.filter(
          (discount): discount is Stripe.Discount => !isString(discount),
        ),
      ),
      ...(isDefined(customerDiscount) ? [customerDiscount] : []),
    ];

    return discounts.map(toStripeCouponDiscount).filter(isDefined);
  }

  private async applyCouponArrangementSync({
    workspaceId,
    stripeCouponDiscounts,
  }: {
    workspaceId: string;
    stripeCouponDiscounts: StripeCouponDiscount[];
  }): Promise<void> {
    const now = new Date();
    const couponArrangements = await this.findCouponArrangements(workspaceId);

    const { arrangementIdsToEnd, arrangementEndsAtUpdate, discountToRecord } =
      computeCouponArrangementSync({
        couponArrangements,
        stripeCouponDiscounts,
        now,
      });

    if (isNonEmptyArray(arrangementIdsToEnd)) {
      await this.billingArrangementRepository.update(
        workspaceId,
        { id: In(arrangementIdsToEnd) },
        { endsAt: now },
      );
    }

    if (isDefined(arrangementEndsAtUpdate)) {
      await this.billingArrangementRepository.update(
        workspaceId,
        { id: arrangementEndsAtUpdate.arrangementId },
        { endsAt: arrangementEndsAtUpdate.endsAt },
      );
    }

    if (!isDefined(discountToRecord)) {
      return;
    }

    await this.recordCouponArrangement({
      workspaceId,
      discount: discountToRecord,
      workspaceArrangements: couponArrangements.map((arrangement) =>
        arrangementIdsToEnd.includes(arrangement.id)
          ? { ...arrangement, endsAt: now }
          : arrangement,
      ),
    });
  }

  private async recordCouponArrangement({
    workspaceId,
    discount,
    workspaceArrangements,
  }: {
    workspaceId: string;
    discount: StripeCouponDiscount;
    workspaceArrangements: BillingArrangementEntity[];
  }): Promise<void> {
    const arrangement: BillingArrangementDraft = {
      type: BillingArrangementType.COUPON,
      label: BillingArrangementLabel.OTHER,
      comment: null,
      seats: null,
      seatCapMode: null,
      stripePriceId: null,
      stripeCouponId: discount.stripeCouponId,
      creditAllowanceMicro: null,
      stripeCreditNoteId: null,
      creditGrantId: null,
      usageLimitId: null,
      startsAt: discount.startsAt,
      endsAt: discount.endsAt,
    };

    const validationErrors = getBillingArrangementValidationErrors(arrangement);

    const overlappingArrangement = findOverlappingBillingArrangement({
      arrangement: { ...arrangement, revokedAt: null },
      workspaceArrangements,
    });

    if (
      isNonEmptyArray(validationErrors) ||
      isDefined(overlappingArrangement)
    ) {
      this.logger.error(
        `Could not record Stripe coupon ${discount.stripeCouponId} for workspace ${workspaceId}: ${JSON.stringify({ validationErrors, overlappingArrangementId: overlappingArrangement?.id })}`,
      );

      return;
    }

    await this.billingArrangementRepository.insert(workspaceId, {
      ...arrangement,
      grantedByUserId: null,
    });
  }
}
