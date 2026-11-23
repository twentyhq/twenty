import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RECOMPUTE_DIRTY_ROLLUP_RECORDS_JOB_NAME } from 'src/engine/core-modules/rollup-field/constants/recompute-dirty-rollup-records-job-name.constant';
import { ROLLUP_FIELD_DIRTY_RECORDS_PER_JOB } from 'src/engine/core-modules/rollup-field/constants/rollup-field-dirty-records-per-job.constant';
import { RollupFieldComputationService } from 'src/engine/core-modules/rollup-field/services/rollup-field-computation.service';
import { RollupFieldDirtyRecordService } from 'src/engine/core-modules/rollup-field/services/rollup-field-dirty-record.service';
import { type RecomputeDirtyRollupRecordsJobData } from 'src/engine/core-modules/rollup-field/types/recompute-dirty-rollup-records-job-data.type';

@Processor(MessageQueue.rollupFieldQueue)
export class RecomputeDirtyRollupRecordsJob {
  constructor(
    private readonly rollupFieldComputationService: RollupFieldComputationService,
    private readonly rollupFieldDirtyRecordService: RollupFieldDirtyRecordService,
  ) {}

  @Process(RECOMPUTE_DIRTY_ROLLUP_RECORDS_JOB_NAME)
  async handle(jobData: RecomputeDirtyRollupRecordsJobData): Promise<void> {
    const recordIds =
      await this.rollupFieldDirtyRecordService.popDirtyRecordIds({
        ...jobData,
        size: ROLLUP_FIELD_DIRTY_RECORDS_PER_JOB,
      });

    try {
      await this.rollupFieldComputationService.recomputeRollupFieldsOfRecords({
        ...jobData,
        recordIds,
      });
    } catch (error) {
      await this.rollupFieldDirtyRecordService.markRecordsDirty({
        ...jobData,
        recordIds,
      });

      throw error;
    }

    if (recordIds.length === ROLLUP_FIELD_DIRTY_RECORDS_PER_JOB) {
      await this.rollupFieldDirtyRecordService.scheduleRecompute(jobData);
    }
  }
}
