import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillSystemFieldIsSystemSideEffectCommand } from 'src/database/commands/upgrade-version-command/2-21/2-21-workspace-command-1783925862946-backfill-system-field-is-system-side-effect.command';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillCompanyPersonImageIdentifierFieldMetadataIdCommand } from 'src/database/commands/upgrade-version-command/2-21/2-21-workspace-command-1783933696000-backfill-company-person-image-identifier-field-metadata-id.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    TypeOrmModule.forFeature([ApplicationEntity, FieldMetadataEntity]),
    WorkspaceIteratorModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    BackfillSystemFieldIsSystemSideEffectCommand,
    BackfillCompanyPersonImageIdentifierFieldMetadataIdCommand,
  ],
})
export class V2_21_UpgradeVersionCommandModule {}
