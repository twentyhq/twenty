import { Injectable, Logger } from '@nestjs/common';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { APP_VERSION_CHECK_CRON_PATTERN } from 'src/engine/core-modules/application/application-version-check/crons/constants/app-version-check-cron-pattern.constant';
import { AppUpgradeService } from 'src/engine/core-modules/application/application-install/app-upgrade.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class AppVersionCheckCronJob {
  private readonly logger = new Logger(AppVersionCheckCronJob.name);

  constructor(private readonly appUpgradeService: AppUpgradeService) {}

  @Process(AppVersionCheckCronJob.name)
  @SentryCronMonitor(
    AppVersionCheckCronJob.name,
    APP_VERSION_CHECK_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    this.logger.log('Starting app version check...');

    try {
      await this.appUpgradeService.checkAllForUpdates();
      this.logger.log('App version check completed successfully');
    } catch (error) {
      this.logger.error(
        `App version check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
