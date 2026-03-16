import { Injectable, Logger } from '@nestjs/common';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { STALE_REGISTRATION_CLEANUP_CRON_PATTERN } from 'src/engine/core-modules/application/application-oauth/stale-registration-cleanup/constants/stale-registration-cleanup-cron-pattern.constant';
import { StaleRegistrationCleanupService } from 'src/engine/core-modules/application/application-oauth/stale-registration-cleanup/services/stale-registration-cleanup.service';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class StaleRegistrationCleanupCronJob {
  private readonly logger = new Logger(StaleRegistrationCleanupCronJob.name);

  constructor(
    private readonly staleRegistrationCleanupService: StaleRegistrationCleanupService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(StaleRegistrationCleanupCronJob.name)
  @SentryCronMonitor(
    StaleRegistrationCleanupCronJob.name,
    STALE_REGISTRATION_CLEANUP_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    this.logger.log('Starting stale OAuth registration cleanup');

    try {
      const deletedCount =
        await this.staleRegistrationCleanupService.cleanupStaleRegistrations();

      this.logger.log(
        `Stale OAuth registration cleanup completed: ${deletedCount} registration(s) deleted`,
      );
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error]);
      throw error;
    }
  }
}
