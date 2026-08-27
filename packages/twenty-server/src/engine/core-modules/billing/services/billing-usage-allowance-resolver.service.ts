/* @license Enterprise */

import { Injectable, type OnModuleInit } from '@nestjs/common';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { UsageAllowanceResolverRegistry } from 'src/engine/core-modules/usage-limit/services/usage-allowance-resolver-registry.service';
import { type UsageAllowanceResolver } from 'src/engine/core-modules/usage-limit/types/usage-allowance-resolver.type';

// Registers itself so the usage-limit module can size quota fallbacks from
// the billing pool without depending on the billing module.
@Injectable()
export class BillingUsageAllowanceResolver
  implements UsageAllowanceResolver, OnModuleInit
{
  constructor(
    private readonly usageAllowanceResolverRegistry: UsageAllowanceResolverRegistry,
    private readonly billingUsageService: BillingUsageService,
  ) {}

  onModuleInit(): void {
    this.usageAllowanceResolverRegistry.register(this);
  }

  async resolveUsageAllowance(workspaceId: string): Promise<number | null> {
    return this.billingUsageService.getUsageAllowanceMicro(workspaceId);
  }
}
