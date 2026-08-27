/* @license Enterprise */

import { Injectable, type OnModuleInit } from '@nestjs/common';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { UsageAllowanceProviderRegistry } from 'src/engine/core-modules/usage-limit/services/usage-allowance-provider-registry.service';
import { type UsageAllowanceProvider } from 'src/engine/core-modules/usage-limit/types/usage-allowance-provider.type';

// Registers itself so the usage-limit module can size quota fallbacks from
// the billing pool without depending on the billing module.
@Injectable()
export class BillingUsageAllowanceProvider
  implements UsageAllowanceProvider, OnModuleInit
{
  constructor(
    private readonly usageAllowanceProviderRegistry: UsageAllowanceProviderRegistry,
    private readonly billingUsageService: BillingUsageService,
  ) {}

  onModuleInit(): void {
    this.usageAllowanceProviderRegistry.register(this);
  }

  async getUsageAllowance(workspaceId: string): Promise<number | null> {
    return this.billingUsageService.getUsageAllowanceMicro(workspaceId);
  }
}
