import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PageLayoutController } from 'src/engine/core-modules/page-layout/controllers/page-layout.controller';
import { PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';
import { PageLayoutResolver } from 'src/engine/core-modules/page-layout/resolvers/page-layout.resolver';
import { PageLayoutTabService } from 'src/engine/core-modules/page-layout/services/page-layout-tab.service';
import { PageLayoutService } from 'src/engine/core-modules/page-layout/services/page-layout.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [PageLayoutEntity, PageLayoutTabEntity, PageLayoutWidgetEntity],
      'core',
    ),
  ],
  controllers: [PageLayoutController],
  providers: [PageLayoutService, PageLayoutTabService, PageLayoutResolver],
  exports: [PageLayoutService, PageLayoutTabService],
})
export class PageLayoutModule {}
