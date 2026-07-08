import { Module } from '@nestjs/common';
import { BackfillActorSourceEnumValuesCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783499671542-backfill-actor-source-enum-values.command';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillCompanyPersonImageIdentifierFieldMetadataIdCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783483513120-backfill-company-person-image-identifier-field-metadata-id.command';
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
    WorkspaceIteratorModule,
    WorkspaceCacheModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    BackfillCompanyPersonImageIdentifierFieldMetadataIdCommand,
    BackfillActorSourceEnumValuesCommand,
  ],
})
export class V2_20_UpgradeVersionCommandModule {}
