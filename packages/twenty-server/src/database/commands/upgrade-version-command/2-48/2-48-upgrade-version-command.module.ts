import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RelabelMessageCampaignCountFieldsCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1791972313415-relabel-message-campaign-count-fields.command';
import { SplitEmailBlockSettingsCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1791972314457-split-email-block-settings-command-menu-item.command';
import { MakeMessageListMemberNonUiCreatableCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1791972315497-make-message-list-member-non-ui-creatable.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    RelabelMessageCampaignCountFieldsCommand,
    SplitEmailBlockSettingsCommandMenuItemCommand,
    MakeMessageListMemberNonUiCreatableCommand,
    provideWorkspaceScopedRepository(FieldMetadataEntity),
  ],
})
export class V2_48_UpgradeVersionCommandModule {}
