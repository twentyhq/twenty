import { Injectable, Logger } from '@nestjs/common';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import { APPLICATION_VERSION_CHECK_CRON_PATTERN } from 'src/engine/core-modules/application/application-upgrade/crons/constants/application-version-check-cron-pattern.constant';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class ApplicationVersionCheckCronJob {
  private readonly logger = new Logger(ApplicationVersionCheckCronJob.name);

  constructor(
    private readonly applicationUpgradeService: ApplicationUpgradeService,
  ) {}

  @Process(ApplicationVersionCheckCronJob.name)
  @SentryCronMonitor(
    ApplicationVersionCheckCronJob.name,
    APPLICATION_VERSION_CHECK_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    this.logger.log('Starting application version check...');

    try {
      await this.applicationUpgradeService.checkAllForUpdates();
      this.logger.log('Application version check completed successfully');
    } catch (error) {
      this.logger.error(
        `Application version check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
