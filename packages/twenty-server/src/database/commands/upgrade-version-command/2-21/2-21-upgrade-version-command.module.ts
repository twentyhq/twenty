import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillSystemFieldIsSystemSideEffectCommand } from 'src/database/commands/upgrade-version-command/2-21/2-21-workspace-command-1783925862946-backfill-system-field-is-system-side-effect.command';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, FieldMetadataEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [BackfillSystemFieldIsSystemSideEffectCommand],
})
export class V2_21_UpgradeVersionCommandModule {}
