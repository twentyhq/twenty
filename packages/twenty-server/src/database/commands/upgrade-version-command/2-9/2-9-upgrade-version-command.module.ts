import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { FixStandardRelationFieldLabelsIconsCommand } from 'src/database/commands/upgrade-version-command/2-9/2-9-workspace-command-1799000040000-fix-standard-relation-field-labels-icons.command';
import { MigrateAiModelPreferencesCommand } from 'src/database/commands/upgrade-version-command/2-9/2-9-workspace-command-1799000000000-migrate-ai-model-preferences.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([KeyValuePairEntity]),
    WorkspaceIteratorModule,
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    MigrateAiModelPreferencesCommand,
    FixStandardRelationFieldLabelsIconsCommand,
  ],
})
export class V2_9_UpgradeVersionCommandModule {}
