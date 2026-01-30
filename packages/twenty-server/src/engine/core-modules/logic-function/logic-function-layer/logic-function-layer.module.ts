import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogicFunctionLayerService } from 'src/engine/core-modules/logic-function/logic-function-layer/services/logic-function-layer.service';
import { LogicFunctionLayerEntity } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogicFunctionLayerEntity])],
  providers: [LogicFunctionLayerService],
  exports: [LogicFunctionLayerService],
})
export class LogicFunctionLayerModule {}
