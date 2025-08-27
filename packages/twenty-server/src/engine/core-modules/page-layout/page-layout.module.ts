import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PageLayoutEntity], 'core')],
  exports: [],
})
export class PageLayoutModule {}
