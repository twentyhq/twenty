import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSeedDemoWorkspaceModule } from 'src/database/commands/data-seed-demo-workspace/data-seed-demo-workspace.module';
import { AddNewAddressFieldToViewsWithDeprecatedAddressFieldCommand } from 'src/database/commands/upgrade-version/0-22/0-22-add-new-address-field-to-views-with-deprecated-address.command';
import { FixObjectMetadataIdStandardIdCommand } from 'src/database/commands/upgrade-version/0-22/0-22-fix-object-metadata-id-standard-id.command';
import { UpdateBooleanFieldsNullDefaultValuesAndNullValuesCommand } from 'src/database/commands/upgrade-version/0-22/0-22-update-boolean-fields-null-default-values-and-null-values.command';
import { UpdateMessageChannelSyncStageEnumCommand } from 'src/database/commands/upgrade-version/0-22/0-22-update-message-channel-sync-stage-enum.command';
import { UpdateMessageChannelSyncStatusEnumCommand } from 'src/database/commands/upgrade-version/0-22/0-22-update-message-channel-sync-status-enum.command';
import { UpgradeTo0_22Command } from 'src/database/commands/upgrade-version/0-22/0-22-upgrade-version.command';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
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
    DataSeedDemoWorkspaceModule,
    WorkspaceCacheVersionModule,
  ],
  providers: [
    FixObjectMetadataIdStandardIdCommand,
    UpdateBooleanFieldsNullDefaultValuesAndNullValuesCommand,
    UpdateMessageChannelSyncStatusEnumCommand,
    UpdateMessageChannelSyncStageEnumCommand,
    AddNewAddressFieldToViewsWithDeprecatedAddressFieldCommand,
    UpgradeTo0_22Command,
  ],
})
export class UpgradeTo0_22CommandModule {}
