import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillMemberRoleUniversalIdentifierCommand } from 'src/database/commands/upgrade-version-command/2-50/2-50-workspace-command-1792413669590-backfill-member-role-universal-identifier.command';
import { AddTimelineActivityLinkedRecordIdIndexCommand } from 'src/database/commands/upgrade-version-command/2-50/2-50-workspace-command-1792423420000-add-timeline-activity-linked-record-id-index.command';
import { WrapBareSelectFilterValuesCommand } from 'src/database/commands/upgrade-version-command/2-50/2-50-workspace-command-1792423785749-wrap-bare-select-filter-values.command';
import { RelabelAppPermissionFlagsCommand } from 'src/database/commands/upgrade-version-command/2-50/2-50-workspace-command-1792429840509-relabel-app-permission-flags.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    RoleModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    BackfillMemberRoleUniversalIdentifierCommand,
    AddTimelineActivityLinkedRecordIdIndexCommand,
    WrapBareSelectFilterValuesCommand,
    RelabelAppPermissionFlagsCommand,
  ],
})
export class V2_50_UpgradeVersionCommandModule {}
