import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddCalendarEventSharingIndexesCommand } from 'src/database/commands/upgrade-version-command/2-49/2-49-workspace-command-1792153151454-add-calendar-event-sharing-indexes.command';
import { StripDerivedRecordFilterPropertiesCommand } from 'src/database/commands/upgrade-version-command/2-49/2-49-workspace-command-1792153804491-strip-derived-record-filter-properties.command';
import { DeleteMorphRelationTargetReferencesCommand } from 'src/database/commands/upgrade-version-command/2-49/2-49-workspace-command-1792154485777-delete-morph-relation-target-references.command';
import { BackfillMemberRoleUniversalIdentifierCommand } from 'src/database/commands/upgrade-version-command/2-49/2-49-workspace-command-1792166511121-backfill-member-role-universal-identifier.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    RoleModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    AddCalendarEventSharingIndexesCommand,
    StripDerivedRecordFilterPropertiesCommand,
    DeleteMorphRelationTargetReferencesCommand,
    BackfillMemberRoleUniversalIdentifierCommand,
  ],
})
export class V2_49_UpgradeVersionCommandModule {}
