/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
@Injectable()
export class BillingCreditRolloverService {
  constructor(
    private readonly billingUsageService: BillingUsageService,
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
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
      workspaceId,
      { stripeCustomerId },
      { creditBalanceMicro: rolloverAmount },
    );
  }
}
