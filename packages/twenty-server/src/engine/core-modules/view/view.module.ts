import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { I18nModule } from 'src/engine/core-modules/i18n/i18n.module';
import { ViewCacheModule } from 'src/engine/core-modules/view/cache/services/view-cache.module';
import { ViewFieldController } from 'src/engine/core-modules/view/controllers/view-field.controller';
import { ViewFilterGroupController } from 'src/engine/core-modules/view/controllers/view-filter-group.controller';
import { ViewFilterController } from 'src/engine/core-modules/view/controllers/view-filter.controller';
import { ViewGroupController } from 'src/engine/core-modules/view/controllers/view-group.controller';
import { ViewSortController } from 'src/engine/core-modules/view/controllers/view-sort.controller';
import { ViewController } from 'src/engine/core-modules/view/controllers/view.controller';
import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewFilterGroupEntity } from 'src/engine/core-modules/view/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/core-modules/view/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/core-modules/view/entities/view-group.entity';
import { ViewSortEntity } from 'src/engine/core-modules/view/entities/view-sort.entity';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { FlatViewModule } from 'src/engine/core-modules/view/flat-view/flat-view.module';
import { ViewFieldResolver } from 'src/engine/core-modules/view/resolvers/view-field.resolver';
import { ViewFilterGroupResolver } from 'src/engine/core-modules/view/resolvers/view-filter-group.resolver';
import { ViewFilterResolver } from 'src/engine/core-modules/view/resolvers/view-filter.resolver';
import { ViewGroupResolver } from 'src/engine/core-modules/view/resolvers/view-group.resolver';
import { ViewSortResolver } from 'src/engine/core-modules/view/resolvers/view-sort.resolver';
import { ViewResolver } from 'src/engine/core-modules/view/resolvers/view.resolver';
import { ViewFieldV2Service } from 'src/engine/core-modules/view/services/view-field-v2.service';
import { ViewFieldService } from 'src/engine/core-modules/view/services/view-field.service';
import { ViewFilterGroupService } from 'src/engine/core-modules/view/services/view-filter-group.service';
import { ViewFilterService } from 'src/engine/core-modules/view/services/view-filter.service';
import { ViewGroupService } from 'src/engine/core-modules/view/services/view-group.service';
import { ViewSortService } from 'src/engine/core-modules/view/services/view-sort.service';
import { ViewV2Service } from 'src/engine/core-modules/view/services/view-v2.service';
import { ViewService } from 'src/engine/core-modules/view/services/view.service';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ViewEntity,
      ViewFieldEntity,
      ViewFilterEntity,
      ViewFilterGroupEntity,
      ViewGroupEntity,
      ViewSortEntity,
    ]),
    I18nModule,
    FeatureFlagModule,
    WorkspaceCacheStorageModule,
    WorkspaceMetadataCacheModule,
    WorkspaceMigrationV2Module,
    ViewCacheModule,
    FlatViewModule,
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
    ViewV2Service,
    ViewFieldV2Service,
  ],
  exports: [
    ViewService,
    ViewFieldService,
    ViewFilterService,
    ViewFilterGroupService,
    ViewGroupService,
    ViewSortService,
    ViewV2Service,
    ViewFieldV2Service,
  ],
})
export class CoreViewModule {}
