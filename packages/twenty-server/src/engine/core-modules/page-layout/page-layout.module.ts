import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PageLayoutTabController } from 'src/engine/core-modules/page-layout/controllers/page-layout-tab.controller';
import { PageLayoutWidgetController } from 'src/engine/core-modules/page-layout/controllers/page-layout-widget.controller';
import { PageLayoutController } from 'src/engine/core-modules/page-layout/controllers/page-layout.controller';
import { PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';
import { PageLayoutTabResolver } from 'src/engine/core-modules/page-layout/resolvers/page-layout-tab.resolver';
import { PageLayoutWidgetResolver } from 'src/engine/core-modules/page-layout/resolvers/page-layout-widget.resolver';
import { PageLayoutResolver } from 'src/engine/core-modules/page-layout/resolvers/page-layout.resolver';
import { PageLayoutTabService } from 'src/engine/core-modules/page-layout/services/page-layout-tab.service';
import { PageLayoutWidgetService } from 'src/engine/core-modules/page-layout/services/page-layout-widget.service';
import { PageLayoutService } from 'src/engine/core-modules/page-layout/services/page-layout.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PageLayoutEntity,
      PageLayoutTabEntity,
      PageLayoutWidgetEntity,
    ]),
  ],
  controllers: [
    PageLayoutController,
    PageLayoutTabController,
    PageLayoutWidgetController,
  ],
  providers: [
    PageLayoutService,
    PageLayoutTabService,
    PageLayoutWidgetService,
    PageLayoutResolver,
    PageLayoutTabResolver,
    PageLayoutWidgetResolver,
  ],
  exports: [PageLayoutService, PageLayoutTabService, PageLayoutWidgetService],
})
export class PageLayoutModule {}
