import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogicFunctionTriggerModule } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.module';
import { ServerWebhookTriggerController } from 'src/engine/core-modules/server-webhook-trigger/server-webhook-trigger.controller';
import { ServerWebhookTriggerService } from 'src/engine/core-modules/server-webhook-trigger/server-webhook-trigger.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogicFunctionEntity]),
    LogicFunctionTriggerModule,
  ],
  controllers: [ServerWebhookTriggerController],
  providers: [ServerWebhookTriggerService],
})
export class ServerWebhookTriggerModule {}
