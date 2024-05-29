import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { TestJobData } from 'src/engine/core-modules/share-context-test/test.job';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';

@Injectable()
export class TestListener {
  constructor(
    @InjectMessageQueue(MessageQueue.testQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Interval(1500)
  async handleTest() {
    const workspaceIds = [
      '3b8e6458-5fc1-4e63-8563-008ccddaa6db',
      '20202020-1c25-4d02-bf25-6aeccf7ea419',
    ];
    const randomWorkspaceId =
      workspaceIds[Math.floor(Math.random() * workspaceIds.length)];

    console.log('Handling test event: ', randomWorkspaceId);
    await this.messageQueueService.add<TestJobData>('emailWelcome', {
      workspaceId: randomWorkspaceId,
    });

    await this.messageQueueService.add<TestJobData>('emailCoucou', {
      workspaceId: randomWorkspaceId,
    });
  }
}
