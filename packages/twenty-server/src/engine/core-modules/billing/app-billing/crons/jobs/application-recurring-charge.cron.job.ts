/* @license Enterprise */

import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { ApplicationRecurringChargeService } from 'src/engine/core-modules/billing/app-billing/application-recurring-charge.service';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

// Daily rather than monthly: the charge is keyed to the workspace's own billing
// period, which starts on a different day for every workspace, and the service
// skips periods it has already charged.
export const APPLICATION_RECURRING_CHARGE_CRON_PATTERN = '0 5 * * *';

const WORKSPACE_BATCH_SIZE = 10;

@Processor(MessageQueue.cronQueue)
export class ApplicationRecurringChargeCronJob {
  private readonly logger = new Logger(ApplicationRecurringChargeCronJob.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly applicationRecurringChargeService: ApplicationRecurringChargeService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(ApplicationRecurringChargeCronJob.name)
  @SentryCronMonitor(
    ApplicationRecurringChargeCronJob.name,
    APPLICATION_RECURRING_CHARGE_CRON_PATTERN,
  )
  async handle() {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: { activationStatus: WorkspaceActivationStatus.ACTIVE },
      select: ['id'],
      order: { id: 'ASC' },
    });

    let chargedCount = 0;

    for (
      let workspaceIndex = 0;
      workspaceIndex < activeWorkspaces.length;
      workspaceIndex += WORKSPACE_BATCH_SIZE
    ) {
      const batch = activeWorkspaces.slice(
        workspaceIndex,
        workspaceIndex + WORKSPACE_BATCH_SIZE,
      );

      const results = await Promise.allSettled(
        batch.map((workspace) =>
          this.applicationRecurringChargeService.chargeDueRecurringCharges(
            workspace.id,
          ),
        ),
      );

      for (const [index, result] of results.entries()) {
        if (result.status === 'fulfilled') {
          chargedCount += result.value;
        }

        if (result.status === 'rejected') {
          this.exceptionHandlerService.captureExceptions([result.reason], {
            workspace: { id: batch[index].id },
          });
        }
      }
    }

    this.logger.log(
      `Completed ApplicationRecurringChargeCronJob, raised ${chargedCount} charge(s)`,
    );
  }
}
