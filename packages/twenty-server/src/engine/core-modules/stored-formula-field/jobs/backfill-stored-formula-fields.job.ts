import { isDefined } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { BACKFILL_STORED_FORMULA_FIELDS_JOB_NAME } from 'src/engine/core-modules/stored-formula-field/constants/backfill-stored-formula-fields-job-name.constant';
import { StoredFormulaFieldComputationService } from 'src/engine/core-modules/stored-formula-field/services/stored-formula-field-computation.service';
import { type BackfillStoredFormulaFieldsJobData } from 'src/engine/core-modules/stored-formula-field/types/backfill-stored-formula-fields-job-data.type';

@Processor(MessageQueue.storedFormulaFieldQueue)
export class BackfillStoredFormulaFieldsJob {
  constructor(
    private readonly storedFormulaFieldComputationService: StoredFormulaFieldComputationService,
    @InjectMessageQueue(MessageQueue.storedFormulaFieldQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(BACKFILL_STORED_FORMULA_FIELDS_JOB_NAME)
  async handle(jobData: BackfillStoredFormulaFieldsJobData): Promise<void> {
    const nextAfterRecordId =
      await this.storedFormulaFieldComputationService.recomputeStoredFormulaFieldsOfNextRecords(
        jobData,
      );

    if (!isDefined(nextAfterRecordId)) {
      return;
    }

    await this.messageQueueService.add<BackfillStoredFormulaFieldsJobData>(
      BACKFILL_STORED_FORMULA_FIELDS_JOB_NAME,
      { ...jobData, afterRecordId: nextAfterRecordId },
      { workspaceId: jobData.workspaceId, isWorkspaceJob: true },
    );
  }
}
