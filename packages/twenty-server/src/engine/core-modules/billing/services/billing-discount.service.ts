/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { DataSource, In } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingArrangementLabel } from 'src/engine/core-modules/billing/enums/billing-arrangement-label.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { type BillingArrangementDraft } from 'src/engine/core-modules/billing/types/billing-arrangement-draft.type';
import { type StripeCouponDiscount } from 'src/engine/core-modules/billing/types/stripe-coupon-discount.type';
import { buildBillingArrangementLockKey } from 'src/engine/core-modules/billing/utils/build-billing-arrangement-lock-key.util';
import { computeDiscountArrangementSync } from 'src/engine/core-modules/billing/utils/compute-discount-arrangement-sync.util';
import { findOverlappingBillingArrangement } from 'src/engine/core-modules/billing/utils/find-overlapping-billing-arrangement.util';
import { getBillingArrangementValidationErrors } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-validation-errors.util';
import { getExpandedDiscounts } from 'src/engine/core-modules/billing/utils/get-expanded-discounts.util';
import { isBillingArrangementActive } from 'src/engine/core-modules/billing/utils/is-billing-arrangement-active.util';
import { toStripeCouponDiscount } from 'src/engine/core-modules/billing/utils/to-stripe-coupon-discount.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class BillingDiscountService {
  private readonly logger = new Logger(BillingDiscountService.name);

  constructor(
    @InjectWorkspaceScopedRepository(BillingArrangementEntity)
    private readonly billingArrangementRepository: WorkspaceScopedRepository<BillingArrangementEntity>,
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    private readonly stripeCustomerService: StripeCustomerService,
    private readonly cacheLockService: CacheLockService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async hasActiveDiscountArrangement(workspaceId: string): Promise<boolean> {
    const now = new Date();
    const discountArrangements =
      await this.findDiscountArrangements(workspaceId);

    return discountArrangements.some((arrangement) =>
      isBillingArrangementActive({ arrangement, now }),
    );
  }

  async syncDiscountArrangement({
    workspaceId,
    stripeCustomerId,
  }: {
    workspaceId: string;
    stripeCustomerId: string;
  }): Promise<void> {
    await this.cacheLockService.withLock(async () => {
      const stripeCouponDiscounts =
        await this.findStripeCouponDiscounts(stripeCustomerId);

      if (stripeCouponDiscounts.length > 1) {
        this.logger.warn(
          `Workspace ${workspaceId} holds ${stripeCouponDiscounts.length} Stripe discounts, only one is mirrored`,
        );
      }

      await this.applyDiscountArrangementSync({
        workspaceId,
        stripeCouponDiscounts,
      });
    }, buildBillingArrangementLockKey(workspaceId));
  }

  private async findDiscountArrangements(
    workspaceId: string,
  ): Promise<BillingArrangementEntity[]> {
    return await this.billingArrangementRepository.find(workspaceId, {
      where: { type: BillingArrangementType.DISCOUNT },
    });
  }

  private async findStripeCouponDiscounts(
    stripeCustomerId: string,
  ): Promise<StripeCouponDiscount[]> {
    const [subscriptions, customerDiscount] = await Promise.all([
      this.stripeSubscriptionService.listCustomerNotEndedSubscriptions({
        stripeCustomerId,
        expand: ['data.discounts'],
      }),
      this.stripeCustomerService.getCustomerDiscount(stripeCustomerId),
    ]);

    return [
      ...subscriptions.flatMap(({ discounts }) =>
        getExpandedDiscounts(discounts),
      ),
      ...(isDefined(customerDiscount) ? [customerDiscount] : []),
    ]
      .map(toStripeCouponDiscount)
      .filter(isDefined);
  }

  private async applyDiscountArrangementSync({
    workspaceId,
    stripeCouponDiscounts,
  }: {
    workspaceId: string;
    stripeCouponDiscounts: StripeCouponDiscount[];
  }): Promise<void> {
    const now = new Date();
    const discountArrangements =
      await this.findDiscountArrangements(workspaceId);

    const { arrangementIdsToEnd, arrangementEndsAtUpdate, discountToRecord } =
      computeDiscountArrangementSync({
        discountArrangements,
        stripeCouponDiscounts,
        now,
      });

    const arrangementToRecord = isDefined(discountToRecord)
      ? this.buildDiscountArrangementOrThrow({
          workspaceId,
          discount: discountToRecord,
          workspaceArrangements: discountArrangements.map((arrangement) =>
            arrangementIdsToEnd.includes(arrangement.id)
              ? { ...arrangement, endsAt: now }
              : arrangement,
          ),
        })
      : null;

    await this.dataSource.transaction(async (entityManager) => {
      const billingArrangementRepository =
        this.billingArrangementRepository.withManager(entityManager);

      if (isNonEmptyArray(arrangementIdsToEnd)) {
        await billingArrangementRepository.update(
          workspaceId,
          { id: In(arrangementIdsToEnd) },
          { endsAt: now },
        );
      }

      if (isDefined(arrangementEndsAtUpdate)) {
        await billingArrangementRepository.update(
          workspaceId,
          { id: arrangementEndsAtUpdate.arrangementId },
          { endsAt: arrangementEndsAtUpdate.endsAt },
        );
      }

      if (isDefined(arrangementToRecord)) {
        await billingArrangementRepository.insert(workspaceId, {
          ...arrangementToRecord,
          grantedByUserId: null,
        });
      }
    });
  }

  private buildDiscountArrangementOrThrow({
    workspaceId,
    discount,
    workspaceArrangements,
  }: {
    workspaceId: string;
    discount: StripeCouponDiscount;
    workspaceArrangements: BillingArrangementEntity[];
  }): BillingArrangementDraft {
    const arrangement: BillingArrangementDraft = {
      type: BillingArrangementType.DISCOUNT,
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
      throw new BillingException(
        `Could not record Stripe coupon ${discount.stripeCouponId} for workspace ${workspaceId}: ${JSON.stringify({ validationErrors, overlappingArrangementId: overlappingArrangement?.id })}`,
        BillingExceptionCode.BILLING_ARRANGEMENT_INVALID,
      );
    }

    return arrangement;
  }
}
