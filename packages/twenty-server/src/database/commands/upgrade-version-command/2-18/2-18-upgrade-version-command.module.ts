import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddMessageIsDraftFieldCommand } from 'src/database/commands/upgrade-version-command/2-18/2-18-workspace-command-1810000005000-add-message-is-draft-field.command';
import { NormalizeLegacyIndexNamesCommand } from 'src/database/commands/upgrade-version-command/2-18/2-18-workspace-command-1799200000000-normalize-legacy-index-names.command';
import { RecomputeSearchVectorsCommand } from 'src/database/commands/upgrade-version-command/2-18/2-18-workspace-command-1799200001000-recompute-search-vectors.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceSchemaManagerModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    AddMessageIsDraftFieldCommand,
    NormalizeLegacyIndexNamesCommand,
    RecomputeSearchVectorsCommand,
  ],
})
export class V2_18_UpgradeVersionCommandModule {}
