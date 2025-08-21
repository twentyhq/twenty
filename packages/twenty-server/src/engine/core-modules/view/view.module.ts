import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { I18nModule } from 'src/engine/core-modules/i18n/i18n.module';
import { ViewFieldController } from 'src/engine/core-modules/view/controllers/view-field.controller';
import { ViewFilterGroupController } from 'src/engine/core-modules/view/controllers/view-filter-group.controller';
import { ViewFilterController } from 'src/engine/core-modules/view/controllers/view-filter.controller';
import { ViewGroupController } from 'src/engine/core-modules/view/controllers/view-group.controller';
import { ViewSortController } from 'src/engine/core-modules/view/controllers/view-sort.controller';
import { ViewController } from 'src/engine/core-modules/view/controllers/view.controller';
import { ViewField } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewFilterGroup } from 'src/engine/core-modules/view/entities/view-filter-group.entity';
import { ViewFilter } from 'src/engine/core-modules/view/entities/view-filter.entity';
import { ViewGroup } from 'src/engine/core-modules/view/entities/view-group.entity';
import { ViewSort } from 'src/engine/core-modules/view/entities/view-sort.entity';
import { View } from 'src/engine/core-modules/view/entities/view.entity';
import { ViewFieldResolver } from 'src/engine/core-modules/view/resolvers/view-field.resolver';
import { ViewFilterGroupResolver } from 'src/engine/core-modules/view/resolvers/view-filter-group.resolver';
import { ViewFilterResolver } from 'src/engine/core-modules/view/resolvers/view-filter.resolver';
import { ViewGroupResolver } from 'src/engine/core-modules/view/resolvers/view-group.resolver';
import { ViewSortResolver } from 'src/engine/core-modules/view/resolvers/view-sort.resolver';
import { ViewResolver } from 'src/engine/core-modules/view/resolvers/view.resolver';
import { ViewFieldService } from 'src/engine/core-modules/view/services/view-field.service';
import { ViewFilterGroupService } from 'src/engine/core-modules/view/services/view-filter-group.service';
import { ViewFilterService } from 'src/engine/core-modules/view/services/view-filter.service';
import { ViewGroupService } from 'src/engine/core-modules/view/services/view-group.service';
import { ViewSortService } from 'src/engine/core-modules/view/services/view-sort.service';
import { ViewService } from 'src/engine/core-modules/view/services/view.service';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [View, ViewField, ViewFilter, ViewFilterGroup, ViewGroup, ViewSort],
      'core',
    ),
    I18nModule,
    WorkspaceCacheStorageModule,
    WorkspaceMetadataCacheModule,
  ],
  controllers: [
    ViewController,
    ViewFieldController,
    ViewFilterController,
    ViewFilterGroupController,
    ViewGroupController,
    ViewSortController,
  ],
  providers: [
    ViewService,
    ViewFieldService,
    ViewFilterService,
    ViewFilterGroupService,
    ViewGroupService,
    ViewSortService,
    ViewResolver,
    ViewFieldResolver,
    ViewFilterResolver,
    ViewFilterGroupResolver,
    ViewGroupResolver,
    ViewSortResolver,
  ],
  exports: [
    ViewService,
    ViewFieldService,
    ViewFilterService,
    ViewFilterGroupService,
    ViewGroupService,
    ViewSortService,
  ],
})
export class CoreViewModule {}
