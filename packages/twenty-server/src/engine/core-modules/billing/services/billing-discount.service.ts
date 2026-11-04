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
import { type StripeDiscount } from 'src/engine/core-modules/billing/types/stripe-discount.type';
import { buildBillingArrangementLockKey } from 'src/engine/core-modules/billing/utils/build-billing-arrangement-lock-key.util';
import { computeDiscountArrangementSync } from 'src/engine/core-modules/billing/utils/compute-discount-arrangement-sync.util';
import { findOverlappingBillingArrangement } from 'src/engine/core-modules/billing/utils/find-overlapping-billing-arrangement.util';
import { getBillingArrangementValidationErrors } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-validation-errors.util';
import { getExpandedDiscounts } from 'src/engine/core-modules/billing/utils/get-expanded-discounts.util';
import { isBillingArrangementActive } from 'src/engine/core-modules/billing/utils/is-billing-arrangement-active.util';
import { toStripeDiscount } from 'src/engine/core-modules/billing/utils/to-stripe-discount.util';
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

  async syncDiscountArrangement({
    workspaceId,
    stripeCustomerId,
  }: {
    workspaceId: string;
    stripeCustomerId: string;
  }): Promise<void> {
    await this.cacheLockService.withLock(async () => {
      const stripeDiscounts = await this.findStripeDiscounts(stripeCustomerId);

      await this.applyDiscountArrangementSync({
        workspaceId,
        stripeDiscounts,
        shouldRecordDiscount: true,
      });
    }, buildBillingArrangementLockKey(workspaceId));
  }

  // Subscription events fire on every seat change, so only a workspace with a discount row to end is synced.
  // They only end rows: a new discount is recorded by its own discount event, and an overlap must not fail the subscription webhook.
  async syncDiscountArrangementIfActive({
    workspaceId,
    stripeCustomerId,
  }: {
    workspaceId: string;
    stripeCustomerId: string;
  }): Promise<void> {
    await this.cacheLockService.withLock(async () => {
      if (!(await this.hasActiveDiscountArrangement(workspaceId))) {
        return;
      }

      const stripeDiscounts = await this.findStripeDiscounts(stripeCustomerId);

      await this.applyDiscountArrangementSync({
        workspaceId,
        stripeDiscounts,
        shouldRecordDiscount: false,
      });
    }, buildBillingArrangementLockKey(workspaceId));
  }

  private async hasActiveDiscountArrangement(
    workspaceId: string,
  ): Promise<boolean> {
    const now = new Date();
    const discountArrangements =
      await this.findDiscountArrangements(workspaceId);

    return discountArrangements.some((arrangement) =>
      isBillingArrangementActive({ arrangement, now }),
    );
  }

  private async findDiscountArrangements(
    workspaceId: string,
  ): Promise<BillingArrangementEntity[]> {
    return await this.billingArrangementRepository.find(workspaceId, {
      where: { type: BillingArrangementType.DISCOUNT },
    });
  }

  private async findStripeDiscounts(
    stripeCustomerId: string,
  ): Promise<StripeDiscount[]> {
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
    ].map(toStripeDiscount);
  }

  private async applyDiscountArrangementSync({
    workspaceId,
    stripeDiscounts,
    shouldRecordDiscount,
  }: {
    workspaceId: string;
    stripeDiscounts: StripeDiscount[];
    shouldRecordDiscount: boolean;
  }): Promise<void> {
    const now = new Date();
    const discountArrangements =
      await this.findDiscountArrangements(workspaceId);

    const {
      arrangementIdsToEnd,
      arrangementEndsAtUpdates,
      discountToRecord,
      unmirroredStripeDiscountIds,
    } = computeDiscountArrangementSync({
      discountArrangements,
      stripeDiscounts,
      now,
    });

    const notMirroredStripeDiscountIds =
      shouldRecordDiscount || !isDefined(discountToRecord)
        ? unmirroredStripeDiscountIds
        : [...unmirroredStripeDiscountIds, discountToRecord.stripeDiscountId];

    if (isNonEmptyArray(notMirroredStripeDiscountIds)) {
      this.logger.warn(
        `Stripe discounts not mirrored for workspace ${workspaceId}: ${notMirroredStripeDiscountIds.join(', ')}`,
      );
    }

    const arrangementToRecord =
      shouldRecordDiscount && isDefined(discountToRecord)
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

      for (const { arrangementId, endsAt } of arrangementEndsAtUpdates) {
        await billingArrangementRepository.update(
          workspaceId,
          { id: arrangementId },
          { endsAt },
        );
      }

      if (isDefined(arrangementToRecord)) {
        // The admin action may record the same discount concurrently and owns its label and grantor
        await billingArrangementRepository
          .createQueryBuilder()
          .insert()
          .values({
            ...arrangementToRecord,
            workspaceId,
            grantedByUserId: null,
          })
          .orIgnore()
          .execute();
      }
    });
  }

  private buildDiscountArrangementOrThrow({
    workspaceId,
    discount,
    workspaceArrangements,
  }: {
    workspaceId: string;
    discount: StripeDiscount;
    workspaceArrangements: BillingArrangementEntity[];
  }): BillingArrangementDraft {
    const arrangement: BillingArrangementDraft = {
      type: BillingArrangementType.DISCOUNT,
      label: BillingArrangementLabel.OTHER,
      comment: null,
      seats: null,
      seatCapMode: null,
      stripePriceId: null,
      stripeDiscountId: discount.stripeDiscountId,
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
        `Could not record Stripe discount ${discount.stripeDiscountId} for workspace ${workspaceId}: ${JSON.stringify({ validationErrors, overlappingArrangementId: overlappingArrangement?.id })}`,
        BillingExceptionCode.BILLING_ARRANGEMENT_INVALID,
      );
    }

    return arrangement;
  }
}
