/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { formatDateForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { type BillingUsageEvent } from 'src/engine/core-modules/billing/types/billing-usage-event.type';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class BillingEventWriterService {
  private readonly logger = new Logger(BillingEventWriterService.name);

  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly billingUsageService: BillingUsageService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async writeAndBill({
    workspaceId,
    billingEvents,
  }: {
    workspaceId: string;
    billingEvents: BillingUsageEvent[];
  }): Promise<void> {
    // Best-effort ClickHouse write — never blocks Stripe billing
    this.writeToClickHouse(workspaceId, billingEvents);

    await this.billingUsageService.billUsage({
      workspaceId,
      billingEvents,
    });
  }

  private writeToClickHouse(
    workspaceId: string,
    billingEvents: BillingUsageEvent[],
  ): void {
    if (!this.twentyConfigService.get('CLICKHOUSE_URL')) {
      return;
    }

    const now = formatDateForClickHouse(new Date());

    const rows = billingEvents.map((event) => ({
      timestamp: now,
      workspaceId,
      userWorkspaceId: event.userWorkspaceId ?? '',
      eventType: event.eventName,
      executionType: event.dimensions?.execution_type ?? '',
      creditsUsed: event.value,
      resourceId: event.dimensions?.resource_id ?? '',
      resourceContext: event.dimensions?.execution_context_1 ?? '',
      metadata: '{}',
    }));

    this.clickHouseService.insert('billingEvent', rows).catch((error) => {
      this.logger.error(
        'Failed to write billing events to ClickHouse',
        error,
      );
    });
  }
}
