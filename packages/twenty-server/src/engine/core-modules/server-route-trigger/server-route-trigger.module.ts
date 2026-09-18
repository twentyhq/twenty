import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';
import { ServerRouteTriggerController } from 'src/engine/core-modules/server-route-trigger/server-route-trigger.controller';
import { ServerRouteTriggerService } from 'src/engine/core-modules/server-route-trigger/server-route-trigger.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogicFunctionEntity]),
    LogicFunctionExecutorModule,
  ],
  controllers: [ServerRouteTriggerController],
  providers: [
    provideWorkspaceScopedRepository(LogicFunctionEntity),
    ServerRouteTriggerService,
  ],
})
export class ServerRouteTriggerModule {}
