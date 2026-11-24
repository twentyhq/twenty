import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { FieldMetadataType } from 'twenty-shared/types';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { DataSource } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RECONCILE_ROLLUP_FIELDS_CRON_PATTERN } from 'src/engine/core-modules/rollup-field/constants/reconcile-rollup-fields-cron-pattern.constant';
import { RECONCILE_ROLLUP_FIELDS_JOB_NAME } from 'src/engine/core-modules/rollup-field/constants/reconcile-rollup-fields-job-name.constant';
import { computeRollupFieldReconcileDelayMs } from 'src/engine/core-modules/rollup-field/utils/compute-rollup-field-reconcile-delay-ms.util';
import { type ReconcileRollupFieldsJobData } from 'src/engine/core-modules/rollup-field/types/reconcile-rollup-fields-job-data.type';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

// Events are lost when a write skips them (raw SQL, imports, foreign key cascades) or a job crashes after popping its records
@Injectable()
@Processor(MessageQueue.cronQueue)
export class ReconcileRollupFieldsCronJob {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    @InjectMessageQueue(MessageQueue.rollupFieldQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(ReconcileRollupFieldsCronJob.name)
  @SentryCronMonitor(
    ReconcileRollupFieldsCronJob.name,
    RECONCILE_ROLLUP_FIELDS_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const workspacesWithRollups = await this.coreDataSource
      .getRepository(FieldMetadataEntity)
      .createQueryBuilder('fieldMetadata')
      .innerJoin('fieldMetadata.workspace', 'workspace')
      .select('DISTINCT fieldMetadata.workspaceId', 'workspaceId')
      .where('fieldMetadata.type = :type', { type: FieldMetadataType.ROLLUP })
      .andWhere('workspace.activationStatus = :activationStatus', {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      })
      .getRawMany<{ workspaceId: string }>();

    for (const { workspaceId } of workspacesWithRollups) {
      try {
        await this.messageQueueService.add<ReconcileRollupFieldsJobData>(
          RECONCILE_ROLLUP_FIELDS_JOB_NAME,
          { workspaceId },
          {
            workspaceId,
            isWorkspaceJob: true,
            delay: computeRollupFieldReconcileDelayMs(workspaceId),
          },
        );
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: { id: workspaceId },
        });
      }
    }
  }
}
