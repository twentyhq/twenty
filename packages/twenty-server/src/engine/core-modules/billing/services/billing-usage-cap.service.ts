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
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { ResourceCreditService } from 'src/engine/core-modules/billing/services/resource-credit.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Raw, Repository } from 'typeorm';

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
    private readonly resourceCreditService: ResourceCreditService,
    private readonly twentyConfigService: TwentyConfigService,
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

  async setSubscriptionItemHasReachedCap(
    billingSubscriptionId: string,
    workspaceId: string,
    hasReachedCap: boolean,
  ): Promise<void> {
    const billingSubscriptionItem =
      await this.billingSubscriptionItemRepository.findOne({
        select: {
          id: true,
          hasReachedCurrentPeriodCap: true,
        },
        where: {
          billingSubscriptionId,
          billingProduct: {
            metadata: Raw((alias) => `${alias} @> :metadata::jsonb`, {
              metadata: JSON.stringify({
                productKey: BillingProductKey.RESOURCE_CREDIT,
              }),
            }),
          },
        },
      });

    if (!billingSubscriptionItem) {
      throw new BillingException(
        `Resource credit subscription item not found for workspace ${workspaceId}`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_NOT_FOUND,
      );
    }

    if (billingSubscriptionItem.hasReachedCurrentPeriodCap === hasReachedCap) {
      return;
    }

    await this.billingSubscriptionItemRepository.update(
      { id: billingSubscriptionItem.id },
      { hasReachedCurrentPeriodCap: hasReachedCap },
    );
  }
}
