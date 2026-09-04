import { Injectable, Logger } from '@nestjs/common';

import { APPLICATION_LIFECYCLE_RECONCILIATION_CRON_PATTERN } from 'src/engine/core-modules/application/application-lifecycle-reconciliation/constants/application-lifecycle-reconciliation.constant';
import { ApplicationLifecycleReconciliationService } from 'src/engine/core-modules/application/application-lifecycle-reconciliation/services/application-lifecycle-reconciliation.service';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class ApplicationLifecycleReconciliationCronJob {
  private readonly logger = new Logger(
    ApplicationLifecycleReconciliationCronJob.name,
  );

  constructor(
    private readonly applicationLifecycleReconciliationService: ApplicationLifecycleReconciliationService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(ApplicationLifecycleReconciliationCronJob.name)
  @SentryCronMonitor(
    ApplicationLifecycleReconciliationCronJob.name,
    APPLICATION_LIFECYCLE_RECONCILIATION_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    try {
      const reconciledCount =
        await this.applicationLifecycleReconciliationService.reconcileStuckApplications();

      if (reconciledCount > 0) {
        this.logger.warn(
          `Application lifecycle reconciliation completed: ${reconciledCount} application(s) reconciled`,
        );
      }
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error]);
      throw error;
    }
  }
}
