/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { UsageAllowanceResolver } from 'src/engine/core-modules/usage-limit/interfaces/usage-allowance-resolver.interface';
import { type UsagePoolAvailability } from 'src/engine/core-modules/usage-limit/types/usage-pool-availability.type';

@Injectable()
export class BillingUsageAllowanceResolver extends UsageAllowanceResolver {
  constructor(
    private readonly billingService: BillingService,
    private readonly billingUsageService: BillingUsageService,
  ) {
    super();
  }

  async getPoolAvailability(
    workspaceId: string,
  ): Promise<UsagePoolAvailability> {
    if (!this.billingService.isBillingEnabled()) {
      return 'unlimited';
    }

    const hasAvailableCredits =
      await this.billingUsageService.hasAvailableCredits(workspaceId);

    return hasAvailableCredits ? 'available' : 'exhausted';
  }

  async getAllowanceMicro(workspaceId: string): Promise<number | null> {
    return this.billingUsageService.getCurrentAllowanceMicro(workspaceId);
  }

  async consumeCreditsMicro(
    workspaceId: string,
    costMicro: number,
  ): Promise<number | null> {
    if (!this.billingService.isBillingEnabled()) {
      return null;
    }

    return this.billingUsageService.decrementAvailableCreditsInCache({
      workspaceId,
      usedCredits: costMicro,
    });
  }
}
