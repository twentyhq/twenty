import { Command, CommandRunner, Option } from 'nest-commander';

import {
  RecordPositionBackfillJob,
  RecordPositionBackfillJobData,
} from 'src/engine/api/graphql/workspace-query-runner/jobs/record-position-backfill.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

export type RecordPositionBackfillCommandOptions = {
  workspaceId: string;
  dryRun?: boolean;
};

@Command({
  name: 'migrate-0.20:backfill-record-position',
  description: 'Backfill record position',
})
export class RecordPositionBackfillCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.recordPositionBackfillQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  @Option({
    flags: '-d, --dry-run [dry run]',
    description: 'Dry run: Log backfill actions.',
    required: false,
  })
  dryRun(value: string): boolean {
    return Boolean(value);
  }

  async run(
    _passedParam: string[],
    options: RecordPositionBackfillCommandOptions,
  ): Promise<void> {
    this.messageQueueService.add<RecordPositionBackfillJobData>(
      RecordPositionBackfillJob.name,
      { workspaceId: options.workspaceId, dryRun: options.dryRun ?? false },
      { retryLimit: 3 },
    );
  }
}
