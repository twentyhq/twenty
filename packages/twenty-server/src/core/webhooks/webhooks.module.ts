import { Module } from '@nestjs/common';

import { WebhooksService } from 'src/core/webhooks/webhooks.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { MessageQueueModule } from 'src/integrations/message-queue/message-queue.module';
import { messageQueueModuleFactory } from 'src/integrations/message-queue/message-queue.module-factory';

@Module({
  imports: [
    MessageQueueModule.forRoot({
      useFactory: messageQueueModuleFactory,
      inject: [EnvironmentService],
    }),
  ],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
