import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSeedWorkspaceCommand } from 'src/database/commands/data-seed-dev-workspace.command';
import { ConfirmationQuestion } from 'src/database/commands/questions/confirmation.question';
import { SeedCarrierDataCommand } from 'src/database/commands/seed-carrier-data.command';
import { UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/upgrade-version-command.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { SeederModule } from 'src/engine/seeder/seeder.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceManagerModule } from 'src/engine/workspace-manager/workspace-manager.module';

@Module({
  imports: [
    UpgradeVersionCommandModule,

    // Only needed for the data seed command
    TypeORMModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    SeederModule,
    WorkspaceManagerModule,
    DataSourceModule,
    WorkspaceCacheStorageModule,
    // Add TypeOrmModule with Workspace entity
    TypeOrmModule.forFeature([Workspace], 'core'),
  ],
  providers: [DataSeedWorkspaceCommand, SeedCarrierDataCommand, ConfirmationQuestion],
})
export class DatabaseCommandModule {}