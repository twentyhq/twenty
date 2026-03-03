import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { MarketplaceService } from 'src/engine/core-modules/application/services/marketplace.service';
import { WorkspaceFlatApplicationMapCacheService } from 'src/engine/core-modules/application/services/workspace-flat-application-map-cache.service';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, AgentEntity, WorkspaceEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceCacheModule,
    TwentyConfigModule,
  ],
  exports: [
    ApplicationService,
    WorkspaceFlatApplicationMapCacheService,
    MarketplaceService,
  ],
  providers: [
    ApplicationService,
    WorkspaceFlatApplicationMapCacheService,
    MarketplaceService,
  ],
})
export class ApplicationModule {}
