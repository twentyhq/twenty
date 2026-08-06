import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddWorkspaceMemberOpenRecordInCommand } from 'src/database/commands/upgrade-version-command/2-27/2-27-workspace-command-1785505000000-add-workspace-member-open-record-in.command';
import { SeedObjectOpenRecordInCommand } from 'src/database/commands/upgrade-version-command/2-27/2-27-workspace-command-1785505100000-seed-object-open-record-in.command';
import { SetConnectionJunctionTargetsCommand } from 'src/database/commands/upgrade-version-command/2-27/2-27-workspace-command-1785800000000-set-connection-junction-targets.command';
import { DefaultConnectionTypeToRelationshipCommand } from 'src/database/commands/upgrade-version-command/2-27/2-27-workspace-command-1785810000000-default-connection-type-to-relationship.command';
import { AddConnectionIsReciprocalFieldCommand } from 'src/database/commands/upgrade-version-command/2-27/2-27-workspace-command-1785820000000-add-connection-is-reciprocal-field.command';
import { BackfillMissingStandardSkillsCommand } from 'src/database/commands/upgrade-version-command/2-27/2-27-workspace-command-1785499350000-backfill-standard-skills.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceIteratorModule,
  ],
  providers: [
    AddWorkspaceMemberOpenRecordInCommand,
    SeedObjectOpenRecordInCommand,
    BackfillMissingStandardSkillsCommand,
    SetConnectionJunctionTargetsCommand,
    DefaultConnectionTypeToRelationshipCommand,
    AddConnectionIsReciprocalFieldCommand,
  ],
})
export class V2_27_UpgradeVersionCommandModule {}
