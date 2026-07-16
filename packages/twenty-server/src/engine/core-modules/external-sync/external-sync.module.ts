import { Module } from '@nestjs/common';

import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';

@Module({
  imports: [MessageQueueModule],
  providers: [],
  exports: [],
})
export class ExternalSyncModule {}
