import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogicFunctionLayerService } from 'src/engine/core-modules/logic-function/logic-function-layer/services/logic-function-layer.service';
import { LogicFunctionLayerEntity } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogicFunctionLayerEntity]),
    WorkspaceCacheModule,
  ],
  providers: [LogicFunctionLayerService],
  exports: [LogicFunctionLayerService],
})
export class CoreLogicFunctionLayerModule {}
