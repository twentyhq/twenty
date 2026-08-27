import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type UsageAllowanceProvider } from 'src/engine/core-modules/usage-limit/types/usage-allowance-provider.type';

// Keeps the dependency direction usage-limit <- billing: billing registers its
// implementation at bootstrap instead of usage-limit importing billing.
@Injectable()
export class UsageAllowanceProviderRegistry {
  private provider: UsageAllowanceProvider | null = null;

  register(provider: UsageAllowanceProvider): void {
    this.provider = provider;
  }

  async getUsageAllowance(workspaceId: string): Promise<number | null> {
    if (!isDefined(this.provider)) {
      return null;
    }

    return this.provider.getUsageAllowance(workspaceId);
  }
}
