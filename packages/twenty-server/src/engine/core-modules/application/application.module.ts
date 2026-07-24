import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationGaugeService } from 'src/engine/core-modules/application/application-gauge.service';
import { ApplicationStopModule } from 'src/engine/core-modules/application/application-stop/application-stop.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationResolver } from 'src/engine/core-modules/application/application.resolver';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceFlatApplicationMapCacheService } from 'src/engine/core-modules/application/workspace-flat-application-map-cache.service';
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationEntity,
      ApplicationRegistrationEntity,
      WorkspaceEntity,
      LogicFunctionEntity,
      AgentEntity,
      FrontComponentEntity,
      CommandMenuItemEntity,
      ObjectMetadataEntity,
      ApplicationVariableEntity,
    ]),
    ApplicationStopModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceCacheModule,
    TwentyConfigModule,
    FeatureFlagModule,
    MetricsModule,
  ],
  exports: [
    ApplicationService,
    ApplicationStopModule,
    WorkspaceFlatApplicationMapCacheService,
  ],
  providers: [
    ApplicationResolver,
    ApplicationService,
    ApplicationGaugeService,
    WorkspaceFlatApplicationMapCacheService,
    provideWorkspaceScopedRepository(AgentEntity),
    provideWorkspaceScopedRepository(CommandMenuItemEntity),
  ],
})
export class ApplicationModule {}
