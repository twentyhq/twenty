/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { isDefined } from 'twenty-shared/utils';

import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingSeatChangeService } from 'src/engine/core-modules/billing/services/billing-seat-change.service';
import { computePlanAllowanceMicro } from 'src/engine/core-modules/billing/utils/compute-plan-allowance-micro.util';
import { isBaseProductSubscriptionItem } from 'src/engine/core-modules/billing/utils/is-base-product-subscription-item.util';

@Injectable()
export class BillingPlanAllowanceService {
  constructor(
    private readonly billingSeatChangeService: BillingSeatChangeService,
  ) {}

  async computeAllowance(
    subscription: BillingSubscriptionEntity,
    {
      periodStart = subscription.currentPeriodStart,
      periodEnd = subscription.currentPeriodEnd,
      atPeriodStart = false,
    }: { periodStart?: Date; periodEnd?: Date; atPeriodStart?: boolean } = {},
  ) {
    const baseItem = subscription.billingSubscriptionItems.find(
      isBaseProductSubscriptionItem,
    );
    const workspaceCreditsPerSeat = Number(
      baseItem?.billingProduct.metadata?.workspaceCreditsPerSeat ?? 0,
    );
    const resourceCreditItem = subscription.billingSubscriptionItems.find(
      (item) =>
        item.billingProduct.metadata?.productKey ===
        BillingProductKey.RESOURCE_CREDIT,
    );
    const resourceCreditPrice =
      resourceCreditItem?.billingProduct.billingPrices.find(
        (price) => price.stripePriceId === resourceCreditItem.stripePriceId,
      );
    const seatChanges =
      workspaceCreditsPerSeat > 0
        ? await this.billingSeatChangeService.findSeatChangesSince({
            workspaceId: subscription.workspaceId,
            billingSubscriptionId: subscription.id,
            periodStart,
          })
        : [];
    const allowance = computePlanAllowanceMicro({
      workspaceCreditsPerSeat,
      seats: Number(baseItem?.quantity ?? 0),
      interval: subscription.interval,
      periodStart,
      periodEnd,
      seatChanges,
      atPeriodStart,
      packCreditsMicro: Number(
        resourceCreditPrice?.metadata?.credit_amount ?? 0,
      ),
    });

    return {
      ...allowance,
      // A configured zero-credit plan must still enforce a cap; null disables it.
      planAllowanceMicro:
        allowance.planAllowanceMicro ??
        (isDefined(resourceCreditPrice) || workspaceCreditsPerSeat > 0
          ? 0
          : null),
    };
  }
}
