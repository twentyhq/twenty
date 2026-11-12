import { Module } from '@nestjs/common';

import { ApplicationGrantRoleService } from 'src/engine/core-modules/application/application-grant-role/services/application-grant-role.service';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [ApplicationModule, WorkspaceCacheModule, WorkspaceMigrationModule],
  providers: [ApplicationGrantRoleService],
  exports: [ApplicationGrantRoleService],
})
export class ApplicationGrantRoleModule {}
