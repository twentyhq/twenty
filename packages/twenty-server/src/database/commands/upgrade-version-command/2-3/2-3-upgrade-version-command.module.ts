import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { DropMessageDirectionFieldCommand } from 'src/database/commands/upgrade-version-command/2-3/2-3-workspace-command-1777400000000-drop-message-direction-field.command';
import { BackfillImageIdentifierFieldMetadataIdCommand } from 'src/database/commands/upgrade-version-command/2-3/2-3-workspace-command-1777920000000-backfill-image-identifier-field-metadata-id.command';
import { RebuildUniquePhoneIndexesCommand } from 'src/database/commands/upgrade-version-command/2-3/2-3-workspace-command-1778000000000-rebuild-unique-phone-indexes.command';
import { DeleteGaugeWidgetsCommand } from 'src/database/commands/upgrade-version-command/2-3/2-3-workspace-command-1798000000000-delete-gauge-widgets.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceSchemaManagerModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    DropMessageDirectionFieldCommand,
    BackfillImageIdentifierFieldMetadataIdCommand,
    RebuildUniquePhoneIndexesCommand,
    DeleteGaugeWidgetsCommand,
  ],
})
export class V2_3_UpgradeVersionCommandModule {}
