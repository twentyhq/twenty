import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { IndexRecordShareGrantsByPrincipalAndObjectCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1790939575510-index-record-share-grants-by-principal-and-object.command';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [IndexRecordShareGrantsByPrincipalAndObjectCommand],
})
export class V2_46_UpgradeVersionCommandModule {}
