/* @license Enterprise */

import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type CreditAllowanceProvider } from 'src/engine/core-modules/usage-limit/interfaces/credit-allowance-provider.service';
import { type AnchoredPeriodUnit } from 'src/engine/core-modules/usage-limit/types/anchored-period-unit.type';
import { type CalendarPeriodUnit } from 'src/engine/core-modules/usage-limit/types/calendar-period-unit.type';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';
import { findCreditAllowanceProvider } from 'src/engine/core-modules/usage-limit/utils/find-credit-allowance-provider.util';
import { getCalendarDayPeriod } from 'src/engine/core-modules/usage-limit/utils/get-calendar-day-period.util';
import { getCalendarMonthPeriod } from 'src/engine/core-modules/usage-limit/utils/get-calendar-month-period.util';
import { getCalendarWeekPeriod } from 'src/engine/core-modules/usage-limit/utils/get-calendar-week-period.util';
import { WorkspaceCacheException } from 'src/engine/workspace-cache/exceptions/workspace-cache.exception';

@Injectable()
export class UsagePeriodService implements OnModuleInit {
  private readonly logger = new Logger(UsagePeriodService.name);

  private creditAllowanceProvider: CreditAllowanceProvider | null = null;

  constructor(private readonly discoveryService: DiscoveryService) {}

  onModuleInit() {
    this.creditAllowanceProvider = findCreditAllowanceProvider(
      this.discoveryService,
    );
  }

  async hasAllowancePeriod(workspaceId: string): Promise<boolean> {
    return isDefined(
      await this.creditAllowanceProvider?.getCreditAllowancePeriod(workspaceId),
    );
  }

  async findCurrentPeriod({
    workspaceId,
    periodUnit,
  }: {
    workspaceId: string;
    periodUnit: AnchoredPeriodUnit;
  }): Promise<UsagePeriod | null> {
    if (periodUnit !== 'allowancePeriod') {
      return this.getCalendarPeriod(periodUnit);
    }

    try {
      return (
        (await this.creditAllowanceProvider?.getCreditAllowancePeriod(
          workspaceId,
        )) ?? null
      );
    } catch (error) {
      if (error instanceof WorkspaceCacheException) {
        throw error;
      }

      this.logger.warn(
        `Could not read the allowance period for workspace ${workspaceId}, skipping its allowance-period limits: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return null;
    }
  }

  async findCurrentPeriodsByUnit({
    workspaceId,
    limits,
  }: {
    workspaceId: string;
    limits: FlatUsageLimit[];
  }): Promise<Partial<Record<PeriodUnit, UsagePeriod>>> {
    const periodUnits = [
      ...new Set(
        limits
          .map((limit) => limit.periodUnit)
          .filter(
            (periodUnit): periodUnit is AnchoredPeriodUnit =>
              periodUnit !== 'second',
          ),
      ),
    ];

    const periods = await Promise.all(
      periodUnits.map(async (periodUnit) => ({
        periodUnit,
        period: await this.findCurrentPeriod({ workspaceId, periodUnit }),
      })),
    );

    return Object.fromEntries(
      periods
        .filter(({ period }) => isDefined(period))
        .map(({ periodUnit, period }) => [periodUnit, period]),
    );
  }

  private getCalendarPeriod(periodUnit: CalendarPeriodUnit): UsagePeriod {
    const now = new Date();

    switch (periodUnit) {
      case 'day':
        return getCalendarDayPeriod(now);
      case 'week':
        return getCalendarWeekPeriod(now);
      case 'month':
        return getCalendarMonthPeriod(now);
      default:
        return assertUnreachable(
          periodUnit,
          `Unknown period unit ${periodUnit}`,
        );
    }
  }
}
