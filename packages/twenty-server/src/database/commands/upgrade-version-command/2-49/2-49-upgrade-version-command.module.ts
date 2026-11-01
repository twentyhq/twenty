import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddCalendarEventSharingIndexesCommand } from 'src/database/commands/upgrade-version-command/2-49/2-49-workspace-command-1792153151454-add-calendar-event-sharing-indexes.command';
import { RepairRelationForeignKeyOnDeleteCommand } from 'src/database/commands/upgrade-version-command/2-49/2-49-workspace-command-1792167273000-repair-relation-foreign-key-on-delete.command';
import { StripDerivedRecordFilterPropertiesCommand } from 'src/database/commands/upgrade-version-command/2-49/2-49-workspace-command-1792153804491-strip-derived-record-filter-properties.command';
import { DeleteMorphRelationTargetReferencesCommand } from 'src/database/commands/upgrade-version-command/2-49/2-49-workspace-command-1792154485777-delete-morph-relation-target-references.command';
import { AllowAssistantMessageReactionsCommand } from 'src/database/commands/upgrade-version-command/2-49/2-49-workspace-command-1792172982349-allow-assistant-message-reactions.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    AddCalendarEventSharingIndexesCommand,
    StripDerivedRecordFilterPropertiesCommand,
    DeleteMorphRelationTargetReferencesCommand,
    RepairRelationForeignKeyOnDeleteCommand,
    AllowAssistantMessageReactionsCommand,
  ],
})
export class V2_49_UpgradeVersionCommandModule {}
