import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSeedDemoWorkspaceModule } from 'src/database/commands/data-seed-demo-workspace/data-seed-demo-workspace.module';
import { BackfillNewOnboardingUserVarsCommand } from 'src/database/commands/upgrade-version/0-23/0-23-backfill-new-onboarding-user-vars';
import { MigrateDomainNameFromTextToLinksCommand } from 'src/database/commands/upgrade-version/0-23/0-23-migrate-domain-to-links.command';
import { MigrateLinkFieldsToLinksCommand } from 'src/database/commands/upgrade-version/0-23/0-23-migrate-link-fields-to-links.command';
import { MigrateMessageChannelSyncStatusEnumCommand } from 'src/database/commands/upgrade-version/0-23/0-23-migrate-message-channel-sync-status-enum.command';
import { SetWorkspaceActivationStatusCommand } from 'src/database/commands/upgrade-version/0-23/0-23-set-workspace-activation-status.command';
import { UpdateActivitiesCommand } from 'src/database/commands/upgrade-version/0-23/0-23-update-activities.command';
import { UpgradeVersionCommand } from 'src/database/commands/upgrade-version/upgrade-version.command';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
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
import { ViewModule } from 'src/modules/view/view.module';

@Module({
  imports: [
    WorkspaceManagerModule,
    DataSourceModule,
    OnboardingModule,
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
    FieldMetadataModule,
    ViewModule,
    BillingModule,
  ],
  providers: [
    UpgradeVersionCommand,
    MigrateLinkFieldsToLinksCommand,
    MigrateDomainNameFromTextToLinksCommand,
    MigrateMessageChannelSyncStatusEnumCommand,
    SetWorkspaceActivationStatusCommand,
    UpdateActivitiesCommand,
    BackfillNewOnboardingUserVarsCommand,
  ],
})
export class UpgradeVersionModule {}
