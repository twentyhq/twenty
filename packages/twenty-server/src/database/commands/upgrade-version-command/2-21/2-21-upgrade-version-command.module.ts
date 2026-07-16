import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddExecutiveProfileStandardObjectsCommand } from 'src/database/commands/upgrade-version-command/2-21/2-21-workspace-command-1784144256272-add-executive-profile-standard-objects.command';
import { BackfillSystemFieldIsSystemSideEffectCommand } from 'src/database/commands/upgrade-version-command/2-21/2-21-workspace-command-1783925862946-backfill-system-field-is-system-side-effect.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, FieldMetadataEntity]),
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    AddExecutiveProfileStandardObjectsCommand,
    BackfillSystemFieldIsSystemSideEffectCommand,
  ],
})
export class V2_21_UpgradeVersionCommandModule {}
