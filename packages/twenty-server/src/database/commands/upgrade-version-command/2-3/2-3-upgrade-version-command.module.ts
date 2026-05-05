import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillImageIdentifierFieldMetadataIdCommand } from 'src/database/commands/upgrade-version-command/2-3/2-3-workspace-command-1777920000000-backfill-image-identifier-field-metadata-id.command';
import { DeleteGaugeWidgetsCommand } from 'src/database/commands/upgrade-version-command/2-3/2-3-workspace-command-1798000000000-delete-gauge-widgets.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    BackfillImageIdentifierFieldMetadataIdCommand,
    DeleteGaugeWidgetsCommand,
  ],
})
export class V2_3_UpgradeVersionCommandModule {}
