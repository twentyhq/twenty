import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import {
  UNINSTALL_APPLICATION_JOB_NAME,
  type UninstallApplicationJobData,
} from 'src/engine/core-modules/application/jobs/uninstall-application.job-constants';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

@Processor(MessageQueue.workspaceQueue)
export class UninstallApplicationJob {
  constructor(
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly metricsService: MetricsService,
  ) {}

  @Process(UNINSTALL_APPLICATION_JOB_NAME)
  async handle(data: UninstallApplicationJobData): Promise<void> {
    try {
      await this.applicationSyncService.uninstallApplication({
        applicationUniversalIdentifier: data.applicationUniversalIdentifier,
        workspaceId: data.workspaceId,
      });
    } catch (error) {
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AppUninstallFailed,
        amount: 1,
        attributes: {
          ...data.metricsAttributes,
          error_code:
            error instanceof ApplicationException ? error.code : 'UNKNOWN',
        },
      });

      throw error;
    }

    this.metricsService.incrementCounterBy({
      key: MetricsKeys.AppUninstallSucceeded,
      amount: 1,
      attributes: data.metricsAttributes,
    });
  }
}
