import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceAssistantProfileService } from 'src/engine/core-modules/workspace/services/workspace-assistant-profile.service';
import { WorkspaceAssistantProfileResolver } from 'src/engine/core-modules/workspace/workspace-assistant-profile.resolver';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    CoreEntityCacheModule,
    FeatureFlagModule,
    PermissionsModule,
  ],
  providers: [
    WorkspaceAssistantProfileService,
    WorkspaceAssistantProfileResolver,
  ],
  exports: [WorkspaceAssistantProfileService],
})
export class WorkspaceAssistantProfileModule {}
