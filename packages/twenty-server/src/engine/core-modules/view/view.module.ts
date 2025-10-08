import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ViewFieldModule } from 'src/engine/core-modules/view-field/view-field.module';
import { ViewFilterGroupController } from 'src/engine/core-modules/view/controllers/view-filter-group.controller';
import { ViewFilterController } from 'src/engine/core-modules/view/controllers/view-filter.controller';
import { ViewGroupController } from 'src/engine/core-modules/view/controllers/view-group.controller';
import { ViewSortController } from 'src/engine/core-modules/view/controllers/view-sort.controller';
import { ViewController } from 'src/engine/core-modules/view/controllers/view.controller';
import { ViewFilterGroupEntity } from 'src/engine/core-modules/view/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/core-modules/view/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/core-modules/view/entities/view-group.entity';
import { ViewSortEntity } from 'src/engine/core-modules/view/entities/view-sort.entity';
import { FlatViewModule } from 'src/engine/core-modules/view/flat-view/flat-view.module';
import { ViewFilterGroupResolver } from 'src/engine/core-modules/view/resolvers/view-filter-group.resolver';
import { ViewFilterResolver } from 'src/engine/core-modules/view/resolvers/view-filter.resolver';
import { ViewGroupResolver } from 'src/engine/core-modules/view/resolvers/view-group.resolver';
import { ViewSortResolver } from 'src/engine/core-modules/view/resolvers/view-sort.resolver';
import { ViewResolver } from 'src/engine/core-modules/view/resolvers/view.resolver';
import { ViewFilterGroupService } from 'src/engine/core-modules/view/services/view-filter-group.service';
import { ViewFilterService } from 'src/engine/core-modules/view/services/view-filter.service';
import { ViewGroupService } from 'src/engine/core-modules/view/services/view-group.service';
import { ViewSortService } from 'src/engine/core-modules/view/services/view-sort.service';
import { ViewV2Service } from 'src/engine/core-modules/view/services/view-v2.service';
import { ViewCoreModule } from 'src/engine/core-modules/view/view-core.module';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ViewFilterEntity,
      ViewFilterGroupEntity,
      ViewGroupEntity,
      ViewSortEntity,
    ]),
    ViewCoreModule,
    ViewFieldModule,
    FeatureFlagModule,
    WorkspaceMetadataCacheModule,
    WorkspaceMigrationV2Module,
    FlatViewModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  controllers: [
    ViewController,
    ViewFilterController,
    ViewFilterGroupController,
    ViewGroupController,
    ViewSortController,
  ],
  providers: [
    ViewFilterService,
    ViewFilterGroupService,
    ViewGroupService,
    ViewSortService,
    ViewResolver,
    ViewFilterResolver,
    ViewFilterGroupResolver,
    ViewGroupResolver,
    ViewSortResolver,
    ViewV2Service,
  ],
  exports: [
    ViewCoreModule,
    ViewFieldModule,
    ViewFilterService,
    ViewFilterGroupService,
    ViewGroupService,
    ViewSortService,
    ViewV2Service,
  ],
})
export class CoreViewModule {}
