import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeduplicateIndexedFieldsCommand } from 'src/database/commands/upgrade-version-command/0-55/0-55-deduplicate-indexed-fields.command';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Workspace,
        AppToken,
        User,
        UserWorkspace,
        FieldMetadataEntity,
        ObjectMetadataEntity,
      ],
      'core',
    ),
    WorkspaceDataSourceModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMetadataVersionModule,
  ],
  providers: [DeduplicateIndexedFieldsCommand],
  exports: [DeduplicateIndexedFieldsCommand],
})
export class V0_55_UpgradeVersionCommandModule {}
