import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { BACKFILL_ROLLUP_FIELDS_JOB_NAME } from 'src/engine/core-modules/rollup-field/constants/backfill-rollup-fields-job-name.constant';
import { RECONCILE_ROLLUP_FIELDS_JOB_NAME } from 'src/engine/core-modules/rollup-field/constants/reconcile-rollup-fields-job-name.constant';
import { type BackfillRollupFieldsJobData } from 'src/engine/core-modules/rollup-field/types/backfill-rollup-fields-job-data.type';
import { type ReconcileRollupFieldsJobData } from 'src/engine/core-modules/rollup-field/types/reconcile-rollup-fields-job-data.type';
import { getRollupFieldWatchPlans } from 'src/engine/core-modules/rollup-field/utils/get-rollup-field-watch-plans.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Processor(MessageQueue.rollupFieldQueue)
export class ReconcileRollupFieldsJob {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectMessageQueue(MessageQueue.rollupFieldQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(RECONCILE_ROLLUP_FIELDS_JOB_NAME)
  async handle({ workspaceId }: ReconcileRollupFieldsJobData): Promise<void> {
    const { objectMetadataIdsWithRollups } = getRollupFieldWatchPlans(
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMapsOrm',
      ]),
    );

    for (const objectMetadataId of objectMetadataIdsWithRollups) {
      // Chained backfill jobs keep this id, so a reconcile still running the next night is not started twice
      const deduplicationId = `rollup-field-reconcile:${workspaceId}:${objectMetadataId}`;

      await this.messageQueueService.add<BackfillRollupFieldsJobData>(
        BACKFILL_ROLLUP_FIELDS_JOB_NAME,
        { workspaceId, objectMetadataId, afterRecordId: null, deduplicationId },
        {
          workspaceId,
          isWorkspaceJob: true,
          deduplication: { id: deduplicationId, keepLastIfActive: true },
        },
      );
    }
  }
}
