import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
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
import { PageLayoutPermissionService } from 'src/engine/core-modules/page-layout/services/page-layout-permission.service';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PageLayoutEntity,
      PageLayoutTabEntity,
      PageLayoutWidgetEntity,
    ]),
    TwentyORMModule,
    UserRoleModule,
    WorkspacePermissionsCacheModule,
    ApiKeyModule,
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
    PageLayoutPermissionService,
    PageLayoutResolver,
    PageLayoutTabResolver,
    PageLayoutWidgetResolver,
  ],
  exports: [PageLayoutService, PageLayoutTabService, PageLayoutWidgetService],
})
export class PageLayoutModule {}
