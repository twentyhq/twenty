import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';
import { ServerRouteTriggerController } from 'src/engine/core-modules/server-route-trigger/server-route-trigger.controller';
import { ServerRouteTriggerService } from 'src/engine/core-modules/server-route-trigger/server-route-trigger.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogicFunctionEntity]),
    LogicFunctionExecutorModule,
    WorkspaceCacheModule,
  ],
  controllers: [ServerRouteTriggerController],
  providers: [ServerRouteTriggerService],
})
export class ServerRouteTriggerModule {}
