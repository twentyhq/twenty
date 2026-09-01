/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage/types/usage-period.type';
import { getCalendarDayPeriod } from 'src/engine/core-modules/usage/utils/get-calendar-day-period.util';
import { getCalendarMonthPeriod } from 'src/engine/core-modules/usage/utils/get-calendar-month-period.util';
import { getCalendarWeekPeriod } from 'src/engine/core-modules/usage/utils/get-calendar-week-period.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type AnchoredPeriodUnit = Exclude<PeriodUnit, 'second'>;

@Injectable()
export class UsagePeriodService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async getCurrentPeriod(
    workspaceId: string,
    periodUnit: AnchoredPeriodUnit = 'billingPeriod',
  ): Promise<UsagePeriod> {
    const now = new Date();

    switch (periodUnit) {
      case 'day':
        return getCalendarDayPeriod(now);
      case 'week':
        return getCalendarWeekPeriod(now);
      case 'month':
        return getCalendarMonthPeriod(now);
      case 'billingPeriod':
        return this.getBillingPeriod(workspaceId, now);
    }
  }

  private async getBillingPeriod(
    workspaceId: string,
    now: Date,
  ): Promise<UsagePeriod> {
    if (this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      const { currentBillingSubscription } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'currentBillingSubscription',
        ]);

      if (currentBillingSubscription !== NO_BILLING_SUBSCRIPTION) {
        return {
          periodStart: new Date(currentBillingSubscription.currentPeriodStart),
          periodEnd: new Date(currentBillingSubscription.currentPeriodEnd),
        };
      }
    }

    return getCalendarMonthPeriod(now);
  }
}
