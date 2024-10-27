import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnforceUniqueConstraintsCommand } from 'src/database/commands/upgrade-version/0-32/0-32-enforce-unique-constraints.command';
import { SimplifySearchVectorExpressionCommand } from 'src/database/commands/upgrade-version/0-32/0-32-simplify-search-vector-expression';
import { UpgradeTo0_32Command } from 'src/database/commands/upgrade-version/0-32/0-32-upgrade-version.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SearchModule } from 'src/engine/metadata-modules/search/search.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceSyncMetadataCommandsModule } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/workspace-sync-metadata-commands.module';
import { CopyWebhookOperationIntoOperationsCommand } from 'src/database/commands/upgrade-version/0-32/0-32-copy-webhook-operation-into-operations-command';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature(
      [ObjectMetadataEntity, FieldMetadataEntity],
      'metadata',
    ),
    WorkspaceSyncMetadataCommandsModule,
    SearchModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    UpgradeTo0_32Command,
    EnforceUniqueConstraintsCommand,
    CopyWebhookOperationIntoOperationsCommand,
    SimplifySearchVectorExpressionCommand,
  ],
})
export class UpgradeTo0_32CommandModule {}
