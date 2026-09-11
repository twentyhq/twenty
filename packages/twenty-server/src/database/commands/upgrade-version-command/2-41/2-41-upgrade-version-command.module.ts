import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { MigrateStandardChildObjectsToInheritedAccessCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789153800002-migrate-standard-child-objects-to-inherited-access.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [MigrateStandardChildObjectsToInheritedAccessCommand],
})
export class V2_41_UpgradeVersionCommandModule {}
