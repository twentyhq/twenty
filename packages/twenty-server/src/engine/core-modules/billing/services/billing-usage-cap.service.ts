/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { formatDateForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { MeteredCreditService } from 'src/engine/core-modules/billing/services/metered-credit.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FeatureFlagKey } from 'twenty-shared/types';
import { Not, Raw, Repository } from 'typeorm';

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
    private readonly featureFlagService: FeatureFlagService,
    @InjectRepository(BillingSubscriptionItemEntity)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItemEntity>,
  ) {}

  isClickHouseEnabled(): boolean {
    return Boolean(this.twentyConfigService.get('CLICKHOUSE_URL'));
  }

  async getBatchPeriodCreditsUsed(
    workspaceIds: string[],
    periodStart: Date,
  ): Promise<Map<string, number>> {
    const result = new Map<string, number>();

    if (!this.isClickHouseEnabled() || workspaceIds.length === 0) {
      return result;
    }

    const query = `
      SELECT workspaceId, sum(creditsUsedMicro) AS total
      FROM usageEvent
      WHERE workspaceId IN {workspaceIds:Array(String)}
        AND periodStart = {periodStart:Date}
      GROUP BY workspaceId
    `;

    const rows = await this.clickHouseService.select<BatchUsageSumRow>(query, {
      workspaceIds,
      periodStart: formatDateForClickHouse(periodStart),
    });

    for (const row of rows) {
      const rawTotal = row.total ?? 0;
      const total = typeof rawTotal === 'string' ? Number(rawTotal) : rawTotal;

      result.set(row.workspaceId, Number.isFinite(total) ? total : 0);
    }

    return result;
  }

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

  // V2 path — uses extractResourceCreditPricingInfo (productKey === RESOURCE_CREDIT)
  // instead of extractMeteredPricingInfoFromSubscription (productKey === WORKFLOW_NODE_EXECUTION)
  evaluateCapBatchV2(
    subscriptions: BillingSubscriptionEntity[],
    usageByWorkspace: Map<string, number>,
    creditBalanceByCustomer: Map<string, number>,
  ): Map<string, BillingCapEvaluation> {
    const results = new Map<string, BillingCapEvaluation>();

    for (const subscription of subscriptions) {
      const resourceCreditPricingInfo =
        this.meteredCreditService.extractResourceCreditPricingInfo(
          subscription,
        );

      if (!resourceCreditPricingInfo) {
        results.set(subscription.id, {
          skipped: true,
          reason: 'no-metered-item',
        });
        continue;
      }

      const usage = usageByWorkspace.get(subscription.workspaceId) ?? 0;
      const creditBalance =
        creditBalanceByCustomer.get(subscription.stripeCustomerId) ?? 0;
      const allowance = resourceCreditPricingInfo.tierCap + creditBalance;

      results.set(subscription.id, {
        skipped: false,
        hasReachedCap: usage >= allowance,
        usage,
        allowance,
        tierCap: resourceCreditPricingInfo.tierCap,
        creditBalance,
      });
    }

    return results;
  }

  async setSubscriptionItemHasReachedCap(
    workspaceId: string,
    hasReachedCap: boolean,
  ): Promise<void> {
    const isV2 = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_BILLING_V2_ENABLED,
      workspaceId,
    );

    const productKey = isV2
      ? BillingProductKey.RESOURCE_CREDIT
      : BillingProductKey.WORKFLOW_NODE_EXECUTION;

    const billingSubscriptionItems =
      await this.billingSubscriptionItemRepository.find({
        where: {
          billingSubscription: {
            workspaceId,
            status: Not(SubscriptionStatus.Canceled),
          },
          billingProduct: {
            metadata: Raw((alias) => `${alias} @> :metadata::jsonb`, {
              metadata: JSON.stringify({
                productKey,
              }),
            }),
          },
        },
      });

    if (billingSubscriptionItems.length !== 1) {
      throw new BillingException(
        `Expected 1 billing subscription item for workspace ${workspaceId}, but got ${billingSubscriptionItems.length}`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_NOT_FOUND,
      );
    }

    await this.billingSubscriptionItemRepository.update(
      { id: billingSubscriptionItems[0].id },
      { hasReachedCurrentPeriodCap: hasReachedCap },
    );
  }
}
