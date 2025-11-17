import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceFlatFeatureFlagMapCacheService } from 'src/engine/core-modules/feature-flag/services/workspace-flat-feature-flag-map-cache.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceFeatureFlagsMapCacheModule } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeORMModule,
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([FeatureFlagEntity])],
      services: [],
      resolvers: [],
    }),
    WorkspaceFeatureFlagsMapCacheModule,
    WorkspacePermissionsCacheModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationV2Module,
  ],
  exports: [FeatureFlagService, WorkspaceFlatFeatureFlagMapCacheService],
  providers: [FeatureFlagService, WorkspaceFlatFeatureFlagMapCacheService],
})
export class FeatureFlagModule {}
