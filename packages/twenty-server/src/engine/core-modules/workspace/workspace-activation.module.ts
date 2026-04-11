import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { UpgradeModule } from 'src/engine/core-modules/upgrade/upgrade.module';
import { WorkspaceActivationService } from 'src/engine/core-modules/workspace/services/workspace-activation.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Global()
@Module({
  imports: [
    UpgradeModule,
    CoreEntityCacheModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
  ],
  providers: [WorkspaceActivationService],
  exports: [WorkspaceActivationService],
})
export class WorkspaceActivationModule {}
