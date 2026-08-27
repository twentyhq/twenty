/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type UsagePeriod } from 'src/engine/core-modules/usage/types/usage-period.type';
import { getCalendarMonthPeriod } from 'src/engine/core-modules/usage/utils/get-calendar-month-period.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Every period-scoped usage read and write must agree on the period bounds,
// so this is the single place they are resolved: the billing subscription
// period when there is one, a UTC calendar month otherwise.
@Injectable()
export class UsagePeriodService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async getCurrentPeriod(workspaceId: string): Promise<UsagePeriod> {
    if (this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      const { currentBillingSubscription } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'currentBillingSubscription',
        ]);

      if (currentBillingSubscription !== NO_BILLING_SUBSCRIPTION) {
        // Cached dates deserialize as ISO strings.
        return {
          periodStart: new Date(currentBillingSubscription.currentPeriodStart),
          periodEnd: new Date(currentBillingSubscription.currentPeriodEnd),
        };
      }
    }

    return getCalendarMonthPeriod(new Date());
  }
}
