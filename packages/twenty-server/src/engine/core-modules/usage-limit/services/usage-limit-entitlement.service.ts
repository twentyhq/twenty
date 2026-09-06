import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { isDefined } from 'twenty-shared/utils';

import { type UsageLimitEntitlementProvider } from 'src/engine/core-modules/usage-limit/interfaces/usage-limit-entitlement-provider.service';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { findEnforceableLimits } from 'src/engine/core-modules/usage-limit/utils/find-enforceable-limits.util';
import { findUsageLimitEntitlementProvider } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-entitlement-provider.util';
import { isIntraWorkspaceScoped } from 'src/engine/core-modules/usage-limit/utils/is-intra-workspace-scoped.util';

@Injectable()
export class UsageLimitEntitlementService implements OnModuleInit {
  private readonly logger = new Logger(UsageLimitEntitlementService.name);

  private entitlementProvider: UsageLimitEntitlementProvider | null = null;

  constructor(private readonly discoveryService: DiscoveryService) {}

  onModuleInit() {
    this.entitlementProvider = findUsageLimitEntitlementProvider(
      this.discoveryService,
    );
  }

  async isIntraWorkspaceLimitEntitled(workspaceId: string): Promise<boolean> {
    return isDefined(this.entitlementProvider)
      ? this.entitlementProvider.hasIntraWorkspaceLimitEntitlement(workspaceId)
      : true;
  }

  async findEnforceableLimits({
    workspaceId,
    limits,
  }: {
    workspaceId: string;
    limits: FlatUsageLimit[];
  }): Promise<FlatUsageLimit[]> {
    if (!limits.some((limit) => isIntraWorkspaceScoped(limit.spenderType))) {
      return limits;
    }

    try {
      return findEnforceableLimits({
        limits,
        isIntraWorkspaceLimitEntitled:
          await this.isIntraWorkspaceLimitEntitled(workspaceId),
      });
    } catch (error) {
      // Enforcement fails open: an entitlement outage must not drop configured limits
      this.logger.warn(
        `Could not read the intra-workspace limit entitlement for workspace ${workspaceId}, enforcing every stored limit: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return limits;
    }
  }
}
