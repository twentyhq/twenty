import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type UsageAllowanceResolver } from 'src/engine/core-modules/usage-limit/types/usage-allowance-resolver.type';

// Keeps the dependency direction usage-limit <- billing: billing pushes its
// resolver in at bootstrap instead of usage-limit importing billing.
@Injectable()
export class UsageAllowanceResolverRegistry {
  private resolver: UsageAllowanceResolver | null = null;

  register(resolver: UsageAllowanceResolver): void {
    this.resolver = resolver;
  }

  async resolveUsageAllowance(workspaceId: string): Promise<number | null> {
    if (!isDefined(this.resolver)) {
      return null;
    }

    return this.resolver.resolveUsageAllowance(workspaceId);
  }
}
