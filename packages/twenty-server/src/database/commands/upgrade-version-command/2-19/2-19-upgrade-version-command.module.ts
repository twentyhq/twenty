import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillWorkspaceCustomApplicationRegistrationCommand } from 'src/database/commands/upgrade-version-command/2-19/2-19-workspace-command-1782853718000-backfill-workspace-custom-application-registration.command';
import { BackfillSystemUniqueIndexUniversalIdentifierCommand } from 'src/database/commands/upgrade-version-command/2-19/2-19-workspace-command-1783093620000-backfill-system-unique-index-universal-identifier.command';
import { BackfillDeterministicFieldUniversalIdentifiersCommand } from 'src/database/commands/upgrade-version-command/2-19/2-19-workspace-command-1783100000000-backfill-deterministic-field-universal-identifiers.command';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    ApplicationModule,
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ApplicationEntity,
      FieldMetadataEntity,
      IndexMetadataEntity,
    ]),
    WorkspaceIteratorModule,
    WorkspaceCacheModule,
    WorkspaceMetadataVersionModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    BackfillWorkspaceCustomApplicationRegistrationCommand,
    BackfillSystemUniqueIndexUniversalIdentifierCommand,
    BackfillDeterministicFieldUniversalIdentifiersCommand,
  ],
})
export class V2_19_UpgradeVersionCommandModule {}
