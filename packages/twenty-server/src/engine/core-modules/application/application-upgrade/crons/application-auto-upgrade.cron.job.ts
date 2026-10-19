import { Injectable } from '@nestjs/common';

import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import { APPLICATION_AUTO_UPGRADE_CRON_PATTERN } from 'src/engine/core-modules/application/application-upgrade/crons/constants/application-auto-upgrade-cron-pattern.constant';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class ApplicationAutoUpgradeCronJob {
  constructor(
    private readonly applicationUpgradeService: ApplicationUpgradeService,
  ) {}

  @Process(ApplicationAutoUpgradeCronJob.name)
  @SentryCronMonitor(
    ApplicationAutoUpgradeCronJob.name,
    APPLICATION_AUTO_UPGRADE_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    await this.applicationUpgradeService.enqueuePendingAutoUpgrades();
  }
}
