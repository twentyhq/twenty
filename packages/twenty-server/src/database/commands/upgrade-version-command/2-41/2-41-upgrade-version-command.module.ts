import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { CorrectStandardFieldAcronymCasingCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789331219041-correct-standard-field-acronym-casing.command';
import { MakeStandardChildObjectsInheritedCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789373200001-make-standard-child-objects-inherited.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    CorrectStandardFieldAcronymCasingCommand,
    MakeStandardChildObjectsInheritedCommand,
  ],
})
export class V2_41_UpgradeVersionCommandModule {}
