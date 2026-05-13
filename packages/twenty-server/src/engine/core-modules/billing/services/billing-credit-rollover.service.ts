/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';

@Injectable()
export class BillingCreditRolloverService {
  constructor(
    private readonly billingUsageService: BillingUsageService,
    @InjectRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: Repository<BillingCustomerEntity>,
  ) {}

  async processRolloverOnPeriodTransition({
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
}
