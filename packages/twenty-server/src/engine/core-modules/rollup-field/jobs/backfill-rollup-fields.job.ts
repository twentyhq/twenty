import { isDefined } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { BACKFILL_ROLLUP_FIELDS_JOB_NAME } from 'src/engine/core-modules/rollup-field/constants/backfill-rollup-fields-job-name.constant';
import { ROLLUP_FIELD_BACKFILL_BATCHES_PER_JOB } from 'src/engine/core-modules/rollup-field/constants/rollup-field-backfill-batches-per-job.constant';
import { RollupFieldComputationService } from 'src/engine/core-modules/rollup-field/services/rollup-field-computation.service';
import { type BackfillRollupFieldsJobData } from 'src/engine/core-modules/rollup-field/types/backfill-rollup-fields-job-data.type';

@Processor(MessageQueue.rollupFieldQueue)
export class BackfillRollupFieldsJob {
  constructor(
    private readonly rollupFieldComputationService: RollupFieldComputationService,
    @InjectMessageQueue(MessageQueue.rollupFieldQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(BACKFILL_ROLLUP_FIELDS_JOB_NAME)
  async handle(jobData: BackfillRollupFieldsJobData): Promise<void> {
    const nextAfterRecordId =
      await this.rollupFieldComputationService.recomputeRollupFieldsOfNextRecords(
        { ...jobData, batchCount: ROLLUP_FIELD_BACKFILL_BATCHES_PER_JOB },
      );

    if (!isDefined(nextAfterRecordId)) {
      return;
    }

    await this.messageQueueService.add<BackfillRollupFieldsJobData>(
      BACKFILL_ROLLUP_FIELDS_JOB_NAME,
      { ...jobData, afterRecordId: nextAfterRecordId },
      { workspaceId: jobData.workspaceId, isWorkspaceJob: true },
    );
  }
}
