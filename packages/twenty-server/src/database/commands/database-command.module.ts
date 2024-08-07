import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StartDataSeedDemoWorkspaceCronCommand } from 'src/database/commands/data-seed-demo-workspace/crons/start-data-seed-demo-workspace.cron.command';
import { StopDataSeedDemoWorkspaceCronCommand } from 'src/database/commands/data-seed-demo-workspace/crons/stop-data-seed-demo-workspace.cron.command';
import { DataSeedDemoWorkspaceCommand } from 'src/database/commands/data-seed-demo-workspace/data-seed-demo-workspace-command';
import { DataSeedDemoWorkspaceModule } from 'src/database/commands/data-seed-demo-workspace/data-seed-demo-workspace.module';
import { DataSeedWorkspaceCommand } from 'src/database/commands/data-seed-dev-workspace.command';
import { ConfirmationQuestion } from 'src/database/commands/questions/confirmation.question';
import { UpgradeTo0_23CommandModule } from 'src/database/commands/upgrade-version/0-23/0-23-upgrade-version.module';
import { UpgradeVersionModule } from 'src/database/commands/upgrade-version/upgrade-version.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WorkspaceCacheVersionModule } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceManagerModule } from 'src/engine/workspace-manager/workspace-manager.module';
import { WorkspaceStatusModule } from 'src/engine/workspace-manager/workspace-status/workspace-manager.module';
import { WorkspaceSyncMetadataModule } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.module';

@Module({
  imports: [
    WorkspaceManagerModule,
    DataSourceModule,
    TypeORMModule,
    TypeOrmModule.forFeature(
      [Workspace, BillingSubscription, FeatureFlagEntity],
      'core',
    ),
    TypeOrmModule.forFeature(
      [FieldMetadataEntity, ObjectMetadataEntity],
      'metadata',
    ),
    WorkspaceModule,
    WorkspaceDataSourceModule,
    WorkspaceSyncMetadataModule,
    WorkspaceStatusModule,
    ObjectMetadataModule,
    FieldMetadataModule,
    DataSeedDemoWorkspaceModule,
    WorkspaceCacheVersionModule,
    UpgradeTo0_23CommandModule,
    UpgradeVersionModule,
  ],
  providers: [
    DataSeedWorkspaceCommand,
    DataSeedDemoWorkspaceCommand,
    ConfirmationQuestion,
    StartDataSeedDemoWorkspaceCronCommand,
    StopDataSeedDemoWorkspaceCronCommand,
  ],
})
export class DatabaseCommandModule {}
