import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';
import { ServerWebhookTriggerController } from 'src/engine/core-modules/server-webhook-trigger/server-webhook-trigger.controller';
import { ServerWebhookTriggerService } from 'src/engine/core-modules/server-webhook-trigger/server-webhook-trigger.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogicFunctionEntity]),
    LogicFunctionExecutorModule,
    WorkspaceCacheModule,
  ],
  controllers: [ServerWebhookTriggerController],
  providers: [ServerWebhookTriggerService],
})
export class ServerWebhookTriggerModule {}
