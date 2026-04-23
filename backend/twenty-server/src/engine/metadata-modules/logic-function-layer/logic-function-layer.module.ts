import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogicFunctionLayerEntity } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogicFunctionLayerEntity])],
  exports: [TypeOrmModule],
})
export class LogicFunctionLayerModule {}
