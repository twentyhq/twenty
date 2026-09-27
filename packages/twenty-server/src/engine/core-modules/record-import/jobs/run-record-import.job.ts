import { isDefined } from 'twenty-shared/utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { type MessageQueueJobProgressContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RecordImportRunnerWorkspaceService } from 'src/engine/core-modules/record-import/services/record-import-runner.workspace-service';
import { RecordImportSessionService } from 'src/engine/core-modules/record-import/services/record-import-session.service';
import { type RecordImportSession } from 'src/engine/core-modules/record-import/types/record-import-session.type';

@Processor(MessageQueue.recordImportQueue)
export class RunRecordImportJob {
  constructor(
    private readonly recordImportSessionService: RecordImportSessionService,
    private readonly recordImportRunnerService: RecordImportRunnerWorkspaceService,
  ) {}

  @Process(RunRecordImportJob.name)
  async handle(
    { workspaceId, id }: Pick<RecordImportSession, 'workspaceId' | 'id'>,
    context: MessageQueueJobProgressContext,
  ): Promise<void> {
    const session = await this.recordImportSessionService.find({
      workspaceId,
      id,
    });

    // The status transition in start is the only way in, so a duplicate or
    // replayed job finds the session past IMPORTING and does nothing (LIFE-1)
    if (!isDefined(session) || session.status !== 'IMPORTING') {
      return;
    }

    await this.recordImportRunnerService.run(session, context);
  }
}
