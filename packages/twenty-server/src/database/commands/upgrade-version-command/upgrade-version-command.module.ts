import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { V0_43_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/0-43/0-43-upgrade-version-command.module';
import { V0_44_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/0-44/0-44-upgrade-version-command.module';
import { V0_50_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/0-50/0-50-upgrade-version-command.module';
import { UpgradeCommand } from 'src/database/commands/upgrade-version-command/upgrade.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceSyncMetadataModule } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    V0_43_UpgradeVersionCommandModule,
    V0_44_UpgradeVersionCommandModule,
    V0_50_UpgradeVersionCommandModule,
    WorkspaceSyncMetadataModule,
  ],
  providers: [UpgradeCommand],
})
export class UpgradeVersionCommandModule {}
