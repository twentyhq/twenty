import { Module } from '@nestjs/common';

import { ApplicationGrantService } from 'src/engine/core-modules/application/application-grant/services/application-grant.service';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [ApplicationModule, WorkspaceCacheModule, WorkspaceMigrationModule],
  providers: [ApplicationGrantService],
  exports: [ApplicationGrantService],
})
export class ApplicationGrantModule {}
