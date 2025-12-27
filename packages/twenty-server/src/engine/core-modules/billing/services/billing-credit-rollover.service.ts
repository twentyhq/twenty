/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingSubscriptionItemService } from 'src/engine/core-modules/billing/services/billing-subscription-item.service';
import { StripeBillingMeterEventService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter-event.service';
import { StripeCreditGrantService } from 'src/engine/core-modules/billing/stripe/services/stripe-credit-grant.service';

@Injectable()
export class BillingCreditRolloverService {
  constructor(
    private readonly stripeCreditGrantService: StripeCreditGrantService,
    private readonly stripeBillingMeterEventService: StripeBillingMeterEventService,
    private readonly billingSubscriptionItemService: BillingSubscriptionItemService,
  ) {}

  async processRolloverOnPeriodTransition({
    stripeCustomerId,
    subscriptionId,
    stripeMeterId,
    previousPeriodStart,
    previousPeriodEnd,
    newPeriodEnd,
    tierQuantity,
    unitPriceCents,
  }: {
    stripeCustomerId: string;
    subscriptionId: string;
    stripeMeterId: string;
    previousPeriodStart: Date;
    previousPeriodEnd: Date;
    newPeriodEnd: Date;
    tierQuantity: number;
    unitPriceCents: number;
  }): Promise<void> {
    // Void any existing rollover grants before creating a new one
    // This ensures only one rollover grant is active at a time
    await this.voidExistingRolloverGrants(stripeCustomerId);

    const usedCredits =
      await this.stripeBillingMeterEventService.sumMeterEvents(
        stripeMeterId,
        stripeCustomerId,
        previousPeriodStart,
        previousPeriodEnd,
      );

    const unusedCredits = Math.max(0, tierQuantity - usedCredits);

    if (unusedCredits <= 0) {
      return;
    }

    const rolloverAmount = Math.min(unusedCredits, tierQuantity);

    await this.stripeCreditGrantService.createCreditGrant({
      customerId: stripeCustomerId,
      creditUnits: rolloverAmount,
      unitPriceCents,
      expiresAt: newPeriodEnd,
      metadata: {
        type: 'rollover',
        fromPeriodStart: previousPeriodStart.toISOString(),
        fromPeriodEnd: previousPeriodEnd.toISOString(),
        subscriptionId,
      },
    });
  }

  private async voidExistingRolloverGrants(
    stripeCustomerId: string,
  ): Promise<void> {
    const existingGrants =
      await this.stripeCreditGrantService.listCreditGrants(stripeCustomerId);

    const rolloverGrants = existingGrants.filter(
      (grant) => grant.metadata?.type === 'rollover' && !grant.voided_at,
    );

    if (rolloverGrants.length === 0) {
      return;
    }

    for (const grant of rolloverGrants) {
      await this.stripeCreditGrantService.voidCreditGrant(grant.id);
    }
  }

  async getWorkflowRolloverParameters(subscriptionId: string): Promise<{
    stripeMeterId: string;
    tierQuantity: number;
    unitPriceCents: number;
  } | null> {
    const meteredDetails =
      await this.billingSubscriptionItemService.getMeteredSubscriptionItemDetails(
        subscriptionId,
      );

    const workflowItem = meteredDetails.find(
      (item) => item.productKey === BillingProductKey.WORKFLOW_NODE_EXECUTION,
    );

    if (!workflowItem) {
      return null;
    }

    return {
      stripeMeterId: workflowItem.stripeMeterId,
      tierQuantity: workflowItem.tierQuantity,
      unitPriceCents: workflowItem.unitPriceCents,
    };
  }
}
