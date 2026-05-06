/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { StripeBillingMeterEventService } from 'src/engine/core-modules/billing/stripe/services/stripe-billing-meter-event.service';
import { StripeCreditGrantService } from 'src/engine/core-modules/billing/stripe/services/stripe-credit-grant.service';

@Injectable()
export class BillingCreditRolloverService {
  constructor(
    private readonly stripeCreditGrantService: StripeCreditGrantService,
    private readonly stripeBillingMeterEventService: StripeBillingMeterEventService,
    private readonly billingUsageService: BillingUsageService,
    @InjectRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: Repository<BillingCustomerEntity>,
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
      await this.refreshCreditBalance(stripeCustomerId, unitPriceCents);

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

    await this.refreshCreditBalance(stripeCustomerId, unitPriceCents);
  }

  // V2 path — reads usedCredits from ClickHouse; writes rollover directly to creditBalanceMicro
  async processRolloverOnPeriodTransitionV2({
    workspaceId,
    stripeCustomerId,
    tierQuantity,
    previousPeriodStart,
  }: {
    workspaceId: string;
    stripeCustomerId: string;
    tierQuantity: number;
    previousPeriodStart: Date;
  }): Promise<void> {
    const usedCredits =
      await this.billingUsageService.getCurrentPeriodCreditsUsed(
        workspaceId,
        previousPeriodStart,
      );

    const unusedCredits = Math.max(0, tierQuantity - usedCredits);
    const rolloverAmount = Math.min(unusedCredits, tierQuantity);

    await this.billingCustomerRepository.update(
      { stripeCustomerId },
      { creditBalanceMicro: rolloverAmount },
    );
  }

  private async refreshCreditBalance(
    stripeCustomerId: string,
    unitPriceCents: number,
  ): Promise<void> {
    const creditBalanceMicro =
      await this.stripeCreditGrantService.getCustomerCreditBalance(
        stripeCustomerId,
        unitPriceCents,
      );

    await this.billingCustomerRepository.update(
      { stripeCustomerId },
      { creditBalanceMicro },
    );
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
}
