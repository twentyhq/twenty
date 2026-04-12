/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { formatDateForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { MeteredCreditService } from 'src/engine/core-modules/billing/services/metered-credit.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Unit reference:
// - ClickHouse `creditsUsedMicro`: 1 credit = $0.000001 (DOLLAR_TO_CREDIT_MULTIPLIER = 1_000_000 credits/$)
// - Stripe tier `up_to`: same unit (credits)
// - Display: converted from credits to dollars via toDollars()

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
}
