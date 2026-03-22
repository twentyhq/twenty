/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { formatDateForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { type UsageEvent } from 'src/engine/core-modules/billing/types/usage-event.type';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class UsageEventWriterService {
  private readonly logger = new Logger(UsageEventWriterService.name);

  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly billingUsageService: BillingUsageService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async billUsage({
    workspaceId,
    usageEvents,
  }: {
    workspaceId: string;
    usageEvents: UsageEvent[];
  }): Promise<void> {
    await this.billingUsageService.billUsage({
      workspaceId,
      usageEvents,
    });
  }

  writeToClickHouse(workspaceId: string, usageEvents: UsageEvent[]): void {
    if (!this.twentyConfigService.get('CLICKHOUSE_URL')) {
      return;
    }

    const now = formatDateForClickHouse(new Date());

    const rows = usageEvents.map((usageEvent) => ({
      timestamp: now,
      workspaceId,
      userWorkspaceId: usageEvent.userWorkspaceId ?? '',
      resourceType: usageEvent.resourceType,
      operationType: usageEvent.operationType,
      quantity: usageEvent.quantity,
      unit: usageEvent.unit,
      creditsUsed: usageEvent.creditsUsed,
      resourceId: usageEvent.resourceId ?? '',
      resourceContext: usageEvent.resourceContext ?? '',
      metadata: '{}',
    }));

    this.clickHouseService.insert('usageEvent', rows).catch((error) => {
      this.logger.error('Failed to write usage events to ClickHouse', error);
    });
  }
}
