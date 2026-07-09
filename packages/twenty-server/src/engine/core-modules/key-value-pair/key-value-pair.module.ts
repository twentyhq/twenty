import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';

@Module({
  imports: [TypeOrmModule.forFeature([KeyValuePairEntity]), TypeORMModule],
  exports: [KeyValuePairService],
  providers: [KeyValuePairService],
})
export class KeyValuePairModule {}
