import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { EnableEditLayoutAcrossAppCommand } from 'src/database/commands/upgrade-version-command/2-37/2-37-workspace-command-1787818021412-enable-edit-layout-across-app.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [EnableEditLayoutAcrossAppCommand],
})
export class V2_37_UpgradeVersionCommandModule {}
