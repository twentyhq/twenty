import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FixObjectMetadataIdStandardIdCommand } from 'src/database/commands/upgrade-version/0-22/0-22-fix-object-metadata-id-standard-id.command';
import { UpdateBooleanFieldsNullDefaultValuesAndNullValuesCommand } from 'src/database/commands/upgrade-version/0-22/0-22-update-boolean-fields-null-default-values-and-null-values.command';
import { UpgradeTo0_22Command } from 'src/database/commands/upgrade-version/0-22/0-22-upgrade-version.command';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceCacheVersionModule } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    WorkspaceCacheVersionModule,
    TypeORMModule,
    DataSourceModule,
  ],
  providers: [
    FixObjectMetadataIdStandardIdCommand,
    UpdateBooleanFieldsNullDefaultValuesAndNullValuesCommand,
    UpgradeTo0_22Command,
  ],
})
export class UpgradeTo0_22CommandModule {}
