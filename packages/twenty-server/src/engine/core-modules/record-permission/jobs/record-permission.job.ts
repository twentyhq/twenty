import { Injectable } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RecordPermissionWorkerService } from 'src/engine/core-modules/record-permission/services/record-permission-worker.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Injectable()
@Processor(MessageQueue.recordPermissionQueue)
export class RecordPermissionJob {
  constructor(
    private readonly worker: RecordPermissionWorkerService,
    @InjectMessageQueue(MessageQueue.recordPermissionQueue)
    private readonly queue: MessageQueueService,
  ) {}

  @Process(RecordPermissionJob.name)
  async handle({
    workspaceId,
  }: {
    workspaceId: string;
    reconcile?: boolean;
  }): Promise<void> {
    await this.worker.reconcile(workspaceId);
    const remaining = await this.worker.drain(workspaceId);

    if (remaining) {
      await this.queue.add(
        RecordPermissionJob.name,
        { workspaceId },
        {
          deduplication: {
            id: `record-permission-${workspaceId}`,
            keepLastIfActive: true,
          },
          retryLimit: 5,
          backoff: {
            strategy: 'exponential',
            initialDelayMilliseconds: 1000,
          },
        },
      );
    }
  }
}
