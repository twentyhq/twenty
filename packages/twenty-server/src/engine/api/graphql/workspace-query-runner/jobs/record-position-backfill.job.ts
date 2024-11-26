import { RecordPositionBackfillService } from 'src/engine/api/graphql/workspace-query-runner/services/record-position-backfill-service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';

export type RecordPositionBackfillJobData = {
  workspaceId: string;
  dryRun: boolean;
};

@Processor(MessageQueue.recordPositionBackfillQueue)
export class RecordPositionBackfillJob {
  constructor(
    private readonly recordPositionBackfillService: RecordPositionBackfillService,
  ) {}

  @Process(RecordPositionBackfillJob.name)
  async handle(data: RecordPositionBackfillJobData): Promise<void> {
    await this.recordPositionBackfillService.backfill(
      data.workspaceId,
      data.dryRun,
    );
  }
}
