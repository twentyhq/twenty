/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { formatDateForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { METERED_OPERATION_TYPES } from 'src/engine/core-modules/billing/constants/metered-operation-types.constant';
import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { MeteredCreditService } from 'src/engine/core-modules/billing/services/metered-credit.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type BillingCapEvaluation =
  | {
      hasReachedCap: true;
      usage: number;
      allowance: number;
      tierCap: number;
      creditBalance: number;
    }
  | {
      hasReachedCap: false;
      usage: number;
      allowance: number;
      tierCap: number;
      creditBalance: number;
    }
  | {
      hasReachedCap: false;
      skipped: true;
      reason: 'no-metered-item' | 'clickhouse-disabled';
    };

type UsageSumRow = {
  total: string | number | null;
};

@Injectable()
export class BillingUsageCapService {
  private readonly logger = new Logger(BillingUsageCapService.name);

  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly meteredCreditService: MeteredCreditService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  isClickHouseEnabled(): boolean {
    return Boolean(this.twentyConfigService.get('CLICKHOUSE_URL'));
  }

  // Returns the sum of creditsUsedMicro for a workspace in [periodStart, periodEnd).
  // Matches Stripe meter semantics: StripeBillingMeterEventService sends
  // creditsUsedMicro as the meter value, so summing the same field in ClickHouse
  // yields the same quantity that Stripe's billing alert would compare against
  // tiers[0].up_to.
  async getCurrentPeriodCreditsUsed(
    workspaceId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<number> {
    if (!this.isClickHouseEnabled()) {
      return 0;
    }

    const query = `
      SELECT sum(creditsUsedMicro) AS total
      FROM usageEvent
      WHERE workspaceId = {workspaceId:String}
        AND operationType IN ({operationTypes:Array(String)})
        AND timestamp >= {periodStart:String}
        AND timestamp < {periodEnd:String}
    `;

    const rows = await this.clickHouseService.select<UsageSumRow>(query, {
      workspaceId,
      operationTypes: [...METERED_OPERATION_TYPES],
      periodStart: formatDateForClickHouse(periodStart),
      periodEnd: formatDateForClickHouse(periodEnd),
    });

    const rawTotal = rows[0]?.total ?? 0;
    const total = typeof rawTotal === 'string' ? Number(rawTotal) : rawTotal;

    return Number.isFinite(total) ? total : 0;
  }

  // Evaluates whether a subscription has reached its metered-credit cap using
  // live pricing read from the database. Because pricing is re-read on every
  // evaluation, tier changes propagate to enforcement within one poll cycle —
  // there is no cached Stripe alert threshold to get out of sync.
  async evaluateCap(
    subscription: BillingSubscriptionEntity,
  ): Promise<BillingCapEvaluation> {
    if (!this.isClickHouseEnabled()) {
      return {
        hasReachedCap: false,
        skipped: true,
        reason: 'clickhouse-disabled',
      };
    }

    const meteredPricingInfo =
      await this.meteredCreditService.getMeteredPricingInfo(subscription.id);

    if (!meteredPricingInfo) {
      return {
        hasReachedCap: false,
        skipped: true,
        reason: 'no-metered-item',
      };
    }

    const creditBalance = await this.meteredCreditService.getCreditBalance(
      subscription.stripeCustomerId,
      meteredPricingInfo.unitPriceCents,
    );

    const usage = await this.getCurrentPeriodCreditsUsed(
      subscription.workspaceId,
      subscription.currentPeriodStart,
      subscription.currentPeriodEnd,
    );

    const allowance = meteredPricingInfo.tierCap + creditBalance;
    const hasReachedCap = usage >= allowance;

    return {
      hasReachedCap,
      usage,
      allowance,
      tierCap: meteredPricingInfo.tierCap,
      creditBalance,
    };
  }
}
