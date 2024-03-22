import { Module } from '@nestjs/common';

import { ConfirmationQuestion } from 'src/database/commands/questions/confirmation.question';
import { WorkspaceManagerModule } from 'src/engine/workspace-manager/workspace-manager.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSeedWorkspaceCommand } from 'src/database/commands/data-seed-dev-workspace.command';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceSyncMetadataModule } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { StartDataSeedDemoWorkspaceCronCommand } from 'src/database/commands/data-seed-demo-workspace/crons/start-data-seed-demo-workspace.cron.command';
import { StopDataSeedDemoWorkspaceCronCommand } from 'src/database/commands/data-seed-demo-workspace/crons/stop-data-seed-demo-workspace.cron.command';
import { WorkspaceAddTotalCountCommand } from 'src/database/commands/workspace-add-total-count.command';
import { DataSeedDemoWorkspaceCommand } from 'src/database/commands/data-seed-demo-workspace/data-seed-demo-workspace-command';
import { DataSeedDemoWorkspaceModule } from 'src/database/commands/data-seed-demo-workspace/data-seed-demo-workspace.module';

@Module({
  imports: [
    WorkspaceManagerModule,
    DataSourceModule,
    TypeORMModule,
    WorkspaceModule,
    WorkspaceDataSourceModule,
    WorkspaceSyncMetadataModule,
    ObjectMetadataModule,
    DataSeedDemoWorkspaceModule,
  ],
  providers: [
    DataSeedWorkspaceCommand,
    DataSeedDemoWorkspaceCommand,
    WorkspaceAddTotalCountCommand,
    ConfirmationQuestion,
    StartDataSeedDemoWorkspaceCronCommand,
    StopDataSeedDemoWorkspaceCronCommand,
  ],
})
export class DatabaseCommandModule {}
