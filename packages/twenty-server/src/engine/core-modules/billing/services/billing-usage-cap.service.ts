/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { formatDateForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { MeteredCreditService } from 'src/engine/core-modules/billing/services/metered-credit.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// All credit values in this service are in micro-credits:
// 1 micro-credit = $0.000001, so 1$ = 1,000,000 micro-credits.
// ClickHouse creditsUsedMicro, Stripe tier up_to, and creditBalanceMicro
// all use this same unit.

export type BillingCapEvaluation =
  | {
      skipped: false;
      hasReachedCap: boolean;
      usage: number;
      allowance: number;
      tierCap: number;
      creditBalance: number;
    }
  | {
      skipped: true;
      reason: 'no-metered-item' | 'clickhouse-disabled';
    };

type UsageSumRow = {
  total: string | number | null;
};

type BatchUsageSumRow = {
  workspaceId: string;
  total: string | number | null;
};

@Injectable()
export class BillingUsageCapService {
  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly meteredCreditService: MeteredCreditService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  isClickHouseEnabled(): boolean {
    return Boolean(this.twentyConfigService.get('CLICKHOUSE_URL'));
  }

  // Sums all creditsUsedMicro for a workspace in [periodStart, periodEnd).
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
        AND timestamp >= {periodStart:String}
        AND timestamp < {periodEnd:String}
    `;

    const rows = await this.clickHouseService.select<UsageSumRow>(query, {
      workspaceId,
      periodStart: formatDateForClickHouse(periodStart),
      periodEnd: formatDateForClickHouse(periodEnd),
    });

    const rawTotal = rows[0]?.total ?? 0;
    const total = typeof rawTotal === 'string' ? Number(rawTotal) : rawTotal;

    return Number.isFinite(total) ? total : 0;
  }

  // Sums creditsUsedMicro for multiple workspaces in a single ClickHouse query.
  // Returns a Map keyed by workspaceId. Missing entries default to 0.
  async getBatchPeriodCreditsUsed(
    workspaceIds: string[],
    periodStart: Date,
    periodEnd: Date,
  ): Promise<Map<string, number>> {
    const result = new Map<string, number>();

    if (!this.isClickHouseEnabled() || workspaceIds.length === 0) {
      return result;
    }

    const query = `
      SELECT workspaceId, sum(creditsUsedMicro) AS total
      FROM usageEvent
      WHERE workspaceId IN {workspaceIds:Array(String)}
        AND timestamp >= {periodStart:String}
        AND timestamp < {periodEnd:String}
      GROUP BY workspaceId
    `;

    const rows = await this.clickHouseService.select<BatchUsageSumRow>(query, {
      workspaceIds,
      periodStart: formatDateForClickHouse(periodStart),
      periodEnd: formatDateForClickHouse(periodEnd),
    });

    for (const row of rows) {
      const rawTotal = row.total ?? 0;
      const total = typeof rawTotal === 'string' ? Number(rawTotal) : rawTotal;

      result.set(row.workspaceId, Number.isFinite(total) ? total : 0);
    }

    return result;
  }

  // Evaluates cap for a single subscription. Makes async calls to ClickHouse + Stripe.
  // Used by non-cron callers. The cron uses evaluateCapBatch instead.
  async evaluateCap(
    subscription: BillingSubscriptionEntity,
  ): Promise<BillingCapEvaluation> {
    if (!this.isClickHouseEnabled()) {
      return { skipped: true, reason: 'clickhouse-disabled' };
    }

    const meteredPricingInfo =
      this.meteredCreditService.extractMeteredPricingInfoFromSubscription(
        subscription,
      );

    if (!meteredPricingInfo) {
      return { skipped: true, reason: 'no-metered-item' };
    }

    const [creditBalance, usage] = await Promise.all([
      this.meteredCreditService.getCreditBalance(
        subscription.stripeCustomerId,
        meteredPricingInfo.unitPriceCents,
      ),
      this.getCurrentPeriodCreditsUsed(
        subscription.workspaceId,
        subscription.currentPeriodStart,
        subscription.currentPeriodEnd,
      ),
    ]);

    const allowance = meteredPricingInfo.tierCap + creditBalance;

    return {
      skipped: false,
      hasReachedCap: usage >= allowance,
      usage,
      allowance,
      tierCap: meteredPricingInfo.tierCap,
      creditBalance,
    };
  }

  // Evaluates cap for a batch of subscriptions using pre-fetched data.
  // usageByWorkspace: Map<workspaceId, creditsUsedMicro> from getBatchPeriodCreditsUsed
  // creditBalanceByCustomer: Map<stripeCustomerId, creditBalanceMicro> from Postgres
  evaluateCapBatch(
    subscriptions: BillingSubscriptionEntity[],
    usageByWorkspace: Map<string, number>,
    creditBalanceByCustomer: Map<string, number>,
  ): Map<string, BillingCapEvaluation> {
    const results = new Map<string, BillingCapEvaluation>();

    for (const subscription of subscriptions) {
      const meteredPricingInfo =
        this.meteredCreditService.extractMeteredPricingInfoFromSubscription(
          subscription,
        );

      if (!meteredPricingInfo) {
        results.set(subscription.id, {
          skipped: true,
          reason: 'no-metered-item',
        });
        continue;
      }

      const usage = usageByWorkspace.get(subscription.workspaceId) ?? 0;
      const creditBalance =
        creditBalanceByCustomer.get(subscription.stripeCustomerId) ?? 0;
      const allowance = meteredPricingInfo.tierCap + creditBalance;

      results.set(subscription.id, {
        skipped: false,
        hasReachedCap: usage >= allowance,
        usage,
        allowance,
        tierCap: meteredPricingInfo.tierCap,
        creditBalance,
      });
    }

    return results;
  }
}
