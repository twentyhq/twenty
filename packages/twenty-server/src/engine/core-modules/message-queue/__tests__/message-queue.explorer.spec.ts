import { DiscoveryModule } from '@nestjs/core';
import { Test } from '@nestjs/testing';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { SyncDriver } from 'src/engine/core-modules/message-queue/drivers/sync.driver';
import { type MessageQueueJobProgressContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueueMetadataAccessor } from 'src/engine/core-modules/message-queue/message-queue-metadata.accessor';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueExplorer } from 'src/engine/core-modules/message-queue/message-queue.explorer';
import { EventLoopStallMonitorService } from 'src/engine/core-modules/message-queue/services/event-loop-stall-monitor.service';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Processor(MessageQueue.workspaceQueue)
class ProgressProcessor {
  @Process('progress-job')
  async handle(
    data: { total: number },
    context: MessageQueueJobProgressContext,
  ) {
    await context.updateProgress({ completed: data.total, total: data.total });
  }
}

describe('MessageQueueExplorer progress context', () => {
  it('lets a decorated processor publish progress through its context', async () => {
    const queue = new MessageQueueService(
      new SyncDriver(),
      MessageQueue.workspaceQueue,
    );
    const module = await Test.createTestingModule({
      imports: [DiscoveryModule],
      providers: [
        ProgressProcessor,
        MessageQueueExplorer,
        MessageQueueMetadataAccessor,
        {
          provide: getQueueToken(MessageQueue.workspaceQueue),
          useValue: queue,
        },
        { provide: TwentyConfigService, useValue: { get: () => [] } },
        {
          provide: ExceptionHandlerService,
          useValue: { captureExceptions: jest.fn() },
        },
        {
          provide: EventLoopStallMonitorService,
          useValue: { registerJobStart: jest.fn(), registerJobEnd: jest.fn() },
        },
      ],
    }).compile();

    try {
      await module.init();
      const [id] = await queue.bulkAdd('progress-job', [
        { data: { total: 10 } },
      ]);

      expect((await queue.getJobs([id]))[id]).toMatchObject({
        state: 'completed',
        progress: { completed: 10, total: 10 },
      });
    } finally {
      await module.close();
    }
  });
});
