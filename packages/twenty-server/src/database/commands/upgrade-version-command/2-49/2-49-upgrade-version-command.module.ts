import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { DeleteMorphRelationTargetReferencesCommand } from 'src/database/commands/upgrade-version-command/2-49/2-49-workspace-command-1792154485777-delete-morph-relation-target-references.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [DeleteMorphRelationTargetReferencesCommand],
})
export class V2_49_UpgradeVersionCommandModule {}
