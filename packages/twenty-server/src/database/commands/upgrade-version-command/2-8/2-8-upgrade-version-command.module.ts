import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillRelationJoinColumnIndexesCommand } from 'src/database/commands/upgrade-version-command/2-8/2-8-workspace-command-1798100000000-backfill-relation-join-column-indexes.command';
import { MigrateAiModelPreferencesCommand } from 'src/database/commands/upgrade-version-command/2-8/2-8-workspace-command-1799000000000-migrate-ai-model-preferences.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([KeyValuePairEntity]),
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    BackfillRelationJoinColumnIndexesCommand,
    MigrateAiModelPreferencesCommand,
  ],
})
export class V2_8_UpgradeVersionCommandModule {}
