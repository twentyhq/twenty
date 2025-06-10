import { Module } from '@nestjs/common';

import { DataSeedWorkspaceCommand } from 'src/database/commands/data-seed-dev-workspace.command';
import { ConfirmationQuestion } from 'src/database/commands/questions/confirmation.question';
import { UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/upgrade-version-command.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { DevSeederModule } from 'src/engine/workspace-manager/dev-seeder/dev-seeder.module';
import { WorkspaceManagerModule } from 'src/engine/workspace-manager/workspace-manager.module';

@Module({
  imports: [
    UpgradeVersionCommandModule,

    // Only needed for the data seed command
    TypeORMModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    DevSeederModule,
    WorkspaceManagerModule,
    DataSourceModule,
    WorkspaceCacheStorageModule,
  ],
  providers: [DataSeedWorkspaceCommand, ConfirmationQuestion],
})
export class DatabaseCommandModule {}
