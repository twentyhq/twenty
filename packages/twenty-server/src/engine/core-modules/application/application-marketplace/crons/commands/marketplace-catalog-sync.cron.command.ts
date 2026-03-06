import { Command, CommandRunner } from 'nest-commander';

import { MARKETPLACE_CATALOG_SYNC_CRON_PATTERN } from 'src/engine/core-modules/application/application-marketplace/crons/constants/marketplace-catalog-sync-cron-pattern.constant';
import { MarketplaceCatalogSyncCronJob } from 'src/engine/core-modules/application/application-marketplace/crons/marketplace-catalog-sync.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:marketplace-catalog-sync',
  description:
    'Starts a cron job to sync the marketplace catalog into ApplicationRegistration',
})
export class MarketplaceCatalogSyncCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.add(MarketplaceCatalogSyncCronJob.name, {});

    await this.messageQueueService.addCron<undefined>({
      jobName: MarketplaceCatalogSyncCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: MARKETPLACE_CATALOG_SYNC_CRON_PATTERN,
        },
      },
    });
  }
}
