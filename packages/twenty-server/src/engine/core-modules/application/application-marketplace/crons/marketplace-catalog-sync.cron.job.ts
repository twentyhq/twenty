import { Injectable, Logger } from '@nestjs/common';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { MARKETPLACE_CATALOG_SYNC_CRON_PATTERN } from 'src/engine/core-modules/application/application-marketplace/crons/constants/marketplace-catalog-sync-cron-pattern.constant';
import { MarketplaceCatalogSyncService } from 'src/engine/core-modules/application/application-marketplace/marketplace-catalog-sync.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class MarketplaceCatalogSyncCronJob {
  private readonly logger = new Logger(MarketplaceCatalogSyncCronJob.name);

  constructor(
    private readonly marketplaceCatalogSyncService: MarketplaceCatalogSyncService,
  ) {}

  @Process(MarketplaceCatalogSyncCronJob.name)
  @SentryCronMonitor(
    MarketplaceCatalogSyncCronJob.name,
    MARKETPLACE_CATALOG_SYNC_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    this.logger.log('Starting marketplace catalog sync...');

    try {
      await this.marketplaceCatalogSyncService.syncCatalog();
      this.logger.log('Marketplace catalog sync completed successfully');
    } catch (error) {
      this.logger.error(
        `Marketplace catalog sync failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
