import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([KeyValuePairEntity]), TypeORMModule],
  exports: [KeyValuePairService],
  providers: [KeyValuePairService],
})
export class KeyValuePairModule {}
