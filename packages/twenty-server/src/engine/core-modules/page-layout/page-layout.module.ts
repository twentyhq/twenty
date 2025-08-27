import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import { PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PageLayoutEntity, PageLayoutTabEntity], 'core'),
  ],
  exports: [],
})
export class PageLayoutModule {}
