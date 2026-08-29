import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { NormalizeCompanyDomainNamesCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787935130000-normalize-company-domain-names.command';
import { AddBlocklistScopeFieldCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787933689056-add-blocklist-scope-field.command';
import { EnableEditLayoutAcrossAppCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787906715270-enable-edit-layout-across-app.command';
import { BackfillLinkedTimelineActivityHappensAtCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787914663665-backfill-linked-timeline-activity-happens-at.command';
import { ConfigureTimelineActivityHappensAtCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787918663365-configure-timeline-activity-happens-at.command';
import { PinAskAiCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787938100000-pin-ask-ai-command-menu-item.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    NormalizeCompanyDomainNamesCommand,
    AddBlocklistScopeFieldCommand,
    EnableEditLayoutAcrossAppCommand,
    BackfillLinkedTimelineActivityHappensAtCommand,
    ConfigureTimelineActivityHappensAtCommand,
    PinAskAiCommandMenuItemCommand,
  ],
})
export class V2_38_UpgradeVersionCommandModule {}
