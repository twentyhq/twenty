import { Module } from '@nestjs/common';

import { ConfirmationQuestion } from 'src/database/commands/questions/confirmation.question';
import { WorkspaceManagerModule } from 'src/workspace/workspace-manager/workspace-manager.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { WorkspaceModule } from 'src/core/workspace/workspace.module';
import { DataSeedWorkspaceCommand } from 'src/database/commands/data-seed-dev-workspace.command';
import { DataSeedDemoWorkspaceCommand } from 'src/database/commands/data-seed-demo-workspace.command';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { WorkspaceSyncMetadataModule } from 'src/workspace/workspace-sync-metadata/workspace-sync-metadata.module';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';
import { WorkspaceAddTotalCountCommand } from 'src/database/commands/workspace-add-total-count.command';

@Module({
  imports: [
    WorkspaceManagerModule,
    DataSourceModule,
    TypeORMModule,
    WorkspaceModule,
    WorkspaceDataSourceModule,
    WorkspaceSyncMetadataModule,
    ObjectMetadataModule,
  ],
  providers: [
    DataSeedWorkspaceCommand,
    DataSeedDemoWorkspaceCommand,
    WorkspaceAddTotalCountCommand,
    ConfirmationQuestion,
  ],
})
export class DatabaseCommandModule {}
