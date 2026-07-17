import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogicFunctionWarmupDispatcher } from 'src/engine/core-modules/logic-function/logic-function-warmup/logic-function-warmup.dispatcher';
import { LogicFunctionWarmupJob } from 'src/engine/core-modules/logic-function/logic-function-warmup/logic-function-warmup.job';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    TwentyConfigModule,
    WorkspaceCacheModule,
  ],
  providers: [LogicFunctionWarmupJob, LogicFunctionWarmupDispatcher],
})
export class LogicFunctionWarmupModule {}
