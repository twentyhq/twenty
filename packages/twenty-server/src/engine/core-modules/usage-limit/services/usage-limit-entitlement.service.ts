import { Injectable, Logger } from '@nestjs/common';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { findEnforceableLimits } from 'src/engine/core-modules/usage-limit/utils/find-enforceable-limits.util';
import { isIntraWorkspaceScoped } from 'src/engine/core-modules/usage-limit/utils/is-intra-workspace-scoped.util';

@Injectable()
export class UsageLimitEntitlementService {
  private readonly logger = new Logger(UsageLimitEntitlementService.name);

  constructor(
    private readonly billingSubscriptionService: BillingSubscriptionService,
  ) {}

  async isIntraWorkspaceLimitEntitled(workspaceId: string): Promise<boolean> {
    return this.billingSubscriptionService.getWorkspaceEntitlementValue(
      workspaceId,
      BillingEntitlementKey.USAGE_LIMIT,
    );
  }

  async findEnforceableLimits<TLimit extends FlatUsageLimit>({
    workspaceId,
    limits,
  }: {
    workspaceId: string;
    limits: TLimit[];
  }): Promise<TLimit[]> {
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
