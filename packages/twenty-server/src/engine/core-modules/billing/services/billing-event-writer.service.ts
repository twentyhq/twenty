/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type BillingExecutionType } from 'src/engine/core-modules/billing/types/billing-dimensions.type';
import { type BillingUsageEvent } from 'src/engine/core-modules/billing/types/billing-usage-event.type';
import { buildUserUsageCacheKey } from 'src/engine/core-modules/billing/utils/build-user-usage-cache-key.util';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';

import { BillingUsageService } from './billing-usage.service';

@Injectable()
export class BillingEventWriterService {
  private readonly logger = new Logger(BillingEventWriterService.name);

  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly billingUsageService: BillingUsageService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async writeBillingEvents(
    workspaceId: string,
    events: BillingUsageEvent[],
  ): Promise<void> {
    if (this.twentyConfigService.get('CLICKHOUSE_URL')) {
      this.writeToClickHouse(workspaceId, events).catch((error) => {
        this.logger.error(
          'Failed to write billing events to ClickHouse',
          error,
        );
      });

      this.invalidateUserUsageCache(workspaceId, events);
    }

    await this.billingUsageService.billUsage({
      workspaceId,
      billingEvents: events,
    });
  }

  private async writeToClickHouse(
    workspaceId: string,
    events: BillingUsageEvent[],
  ): Promise<void> {
    const rows = events.map((event) => ({
      timestamp: new Date(),
      workspaceId,
      userWorkspaceId: event.userWorkspaceId ?? '',
      eventType: event.dimensions?.execution_type ?? '',
      creditsUsed: event.value,
      resourceType: this.mapExecutionTypeToResourceType(
        event.dimensions?.execution_type,
      ),
      resourceId: event.dimensions?.resource_id ?? '',
      metadata: {
        executionContext1: event.dimensions?.execution_context_1 ?? null,
        eventName: event.eventName,
      },
    }));

    await this.clickHouseService.insert('billingEvent', rows);
  }

  private invalidateUserUsageCache(
    workspaceId: string,
    events: BillingUsageEvent[],
  ): void {
    const userWorkspaceIds = new Set(
      events.map((event) => event.userWorkspaceId).filter(isDefined),
    );

    for (const userWorkspaceId of userWorkspaceIds) {
      this.cacheStorage
        .del(buildUserUsageCacheKey(workspaceId, userWorkspaceId))
        .catch(() => {});
    }
  }

  private mapExecutionTypeToResourceType(
    executionType: BillingExecutionType | undefined,
  ): string {
    switch (executionType) {
      case 'ai_token':
        return 'agent';
      case 'workflow_execution':
        return 'workflow';
      case 'app_invocation':
        return 'app';
      case 'code_execution':
        return 'code';
      default:
        return '';
    }
  }
}
