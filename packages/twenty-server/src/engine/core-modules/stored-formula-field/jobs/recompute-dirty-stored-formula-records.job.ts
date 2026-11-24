import { isNonEmptyArray } from 'twenty-shared/utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RECOMPUTE_DIRTY_STORED_FORMULA_RECORDS_JOB_NAME } from 'src/engine/core-modules/stored-formula-field/constants/recompute-dirty-stored-formula-records-job-name.constant';
import { STORED_FORMULA_FIELD_DIRTY_RECORDS_PER_JOB } from 'src/engine/core-modules/stored-formula-field/constants/stored-formula-field-dirty-records-per-job.constant';
import { StoredFormulaFieldComputationService } from 'src/engine/core-modules/stored-formula-field/services/stored-formula-field-computation.service';
import { StoredFormulaFieldDirtyRecordService } from 'src/engine/core-modules/stored-formula-field/services/stored-formula-field-dirty-record.service';
import { type RecomputeDirtyStoredFormulaRecordsJobData } from 'src/engine/core-modules/stored-formula-field/types/recompute-dirty-stored-formula-records-job-data.type';

@Processor(MessageQueue.storedFormulaFieldQueue)
export class RecomputeDirtyStoredFormulaRecordsJob {
  constructor(
    private readonly storedFormulaFieldComputationService: StoredFormulaFieldComputationService,
    private readonly storedFormulaFieldDirtyRecordService: StoredFormulaFieldDirtyRecordService,
  ) {}

  @Process(RECOMPUTE_DIRTY_STORED_FORMULA_RECORDS_JOB_NAME)
  async handle(
    jobData: RecomputeDirtyStoredFormulaRecordsJobData,
  ): Promise<void> {
    const recordIds =
      await this.storedFormulaFieldDirtyRecordService.popDirtyRecordIds({
        ...jobData,
        size: STORED_FORMULA_FIELD_DIRTY_RECORDS_PER_JOB,
      });

    if (!isNonEmptyArray(recordIds)) {
      return;
    }

    try {
      await this.storedFormulaFieldComputationService.recomputeStoredFormulaFieldsOfRecords(
        {
          ...jobData,
          recordIds,
        },
      );
    } catch (error) {
      // The ids stay in the processing set and the next run picks them up
      await this.storedFormulaFieldDirtyRecordService.scheduleRecompute(
        jobData,
      );

      throw error;
    }

    await this.storedFormulaFieldDirtyRecordService.completeDirtyRecordIds({
      ...jobData,
      recordIds,
    });

    if (recordIds.length === STORED_FORMULA_FIELD_DIRTY_RECORDS_PER_JOB) {
      await this.storedFormulaFieldDirtyRecordService.scheduleRecompute(
        jobData,
      );
    }
  }
}
