import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillNewOnboardingUserVarsCommand } from 'src/database/commands/upgrade-version/0-23/0-23-backfill-new-onboarding-user-vars';
import { MigrateDomainNameFromTextToLinksCommand } from 'src/database/commands/upgrade-version/0-23/0-23-migrate-domain-to-links.command';
import { MigrateLinkFieldsToLinksCommand } from 'src/database/commands/upgrade-version/0-23/0-23-migrate-link-fields-to-links.command';
import { MigrateMessageChannelSyncStatusEnumCommand } from 'src/database/commands/upgrade-version/0-23/0-23-migrate-message-channel-sync-status-enum.command';
import { SetWorkspaceActivationStatusCommand } from 'src/database/commands/upgrade-version/0-23/0-23-set-workspace-activation-status.command';
import { UpdateActivitiesCommand } from 'src/database/commands/upgrade-version/0-23/0-23-update-activities.command';
import { UpdateFileFolderStructureCommand } from 'src/database/commands/upgrade-version/0-23/0-23-update-file-folder-structure.command';
import { UpgradeTo0_23Command } from 'src/database/commands/upgrade-version/0-23/0-23-upgrade-version.command';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FileStorageModule } from 'src/engine/integrations/file-storage/file-storage.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WorkspaceCacheVersionModule } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.module';
import { WorkspaceStatusModule } from 'src/engine/workspace-manager/workspace-status/workspace-manager.module';
import { WorkspaceSyncMetadataCommandsModule } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/workspace-sync-metadata-commands.module';
import { ViewModule } from 'src/modules/view/view.module';

@Module({
  imports: [
    WorkspaceSyncMetadataCommandsModule,
    TypeOrmModule.forFeature([Workspace], 'core'),
    FileStorageModule,
    OnboardingModule,
    TypeORMModule,
    DataSourceModule,
    WorkspaceCacheVersionModule,
    FieldMetadataModule,
    DataSourceModule,
    WorkspaceStatusModule,
    TypeOrmModule.forFeature([FieldMetadataEntity], 'metadata'),
    TypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
    TypeORMModule,
    ViewModule,
    BillingModule,
    ObjectMetadataModule,
  ],
  providers: [
    UpdateFileFolderStructureCommand,
    UpgradeTo0_23Command,
    MigrateLinkFieldsToLinksCommand,
    MigrateDomainNameFromTextToLinksCommand,
    MigrateMessageChannelSyncStatusEnumCommand,
    SetWorkspaceActivationStatusCommand,
    UpdateActivitiesCommand,
    BackfillNewOnboardingUserVarsCommand,
    UpgradeTo0_23Command,
  ],
})
export class UpgradeTo0_23CommandModule {}
