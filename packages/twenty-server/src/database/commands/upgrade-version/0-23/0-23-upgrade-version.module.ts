import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MigrateDomainNameFromTextToLinksCommand } from 'src/database/commands/upgrade-version/0-23/0-23-migrate-domain-to-links.command';
import { MigrateLinkFieldsToLinksCommand } from 'src/database/commands/upgrade-version/0-23/0-23-migrate-link-fields-to-links.command';
import { MigrateMessageChannelSyncStatusEnumCommand } from 'src/database/commands/upgrade-version/0-23/0-23-migrate-message-channel-sync-status-enum.command';
import { SetWorkspaceActivationStatusCommand } from 'src/database/commands/upgrade-version/0-23/0-23-set-workspace-activation-status.command';
import { UpgradeTo0_23Command } from 'src/database/commands/upgrade-version/0-23/0-23-upgrade-version.command';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCacheVersionModule } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.module';
import { WorkspaceStatusModule } from 'src/engine/workspace-manager/workspace-status/workspace-manager.module';
import { ViewModule } from 'src/modules/view/view.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    WorkspaceCacheVersionModule,
    FieldMetadataModule,
    DataSourceModule,
    WorkspaceStatusModule,
    TypeOrmModule.forFeature([FieldMetadataEntity], 'metadata'),
    TypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
    TypeORMModule,
    ViewModule,
    BillingModule,
  ],
  providers: [
    MigrateLinkFieldsToLinksCommand,
    MigrateDomainNameFromTextToLinksCommand,
    MigrateMessageChannelSyncStatusEnumCommand,
    SetWorkspaceActivationStatusCommand,
    UpgradeTo0_23Command,
  ],
})
export class UpgradeTo0_23CommandModule {}
