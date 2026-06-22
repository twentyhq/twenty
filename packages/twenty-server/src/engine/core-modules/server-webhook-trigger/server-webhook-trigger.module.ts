import { Module } from '@nestjs/common';

import { ServerLogicFunctionExecutorModule } from 'src/engine/core-modules/server-logic-function-executor/server-logic-function-executor.module';
import { ServerWebhookTriggerController } from 'src/engine/core-modules/server-webhook-trigger/server-webhook-trigger.controller';
import { ServerWebhookTriggerService } from 'src/engine/core-modules/server-webhook-trigger/server-webhook-trigger.service';

@Module({
  imports: [ServerLogicFunctionExecutorModule],
  controllers: [ServerWebhookTriggerController],
  providers: [ServerWebhookTriggerService],
})
export class ServerWebhookTriggerModule {}
