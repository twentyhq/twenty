import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceFeatureFlagsMapCacheModule } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeORMModule,
    TypeOrmModule.forFeature([FeatureFlagEntity]),
    WorkspaceFeatureFlagsMapCacheModule,
    WorkspaceCacheModule,
  ],
  exports: [FeatureFlagService],
  providers: [
    FeatureFlagService,
    provideWorkspaceScopedRepository(FeatureFlagEntity),
  ],
})
export class FeatureFlagModule {}
