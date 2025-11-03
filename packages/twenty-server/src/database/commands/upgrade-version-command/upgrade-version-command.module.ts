import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { V1_10_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-10/1-10-upgrade-version-command.module';
import { V1_6_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-6/1-6-upgrade-version-command.module';
import { V1_7_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-7/1-7-upgrade-version-command.module';
import { V1_8_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-8/1-8-upgrade-version-command.module';
import { UpgradeCommand } from 'src/database/commands/upgrade-version-command/upgrade.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceSyncMetadataModule } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    V1_6_UpgradeVersionCommandModule,
    V1_7_UpgradeVersionCommandModule,
    V1_8_UpgradeVersionCommandModule,
    V1_10_UpgradeVersionCommandModule,
    WorkspaceSyncMetadataModule,
  ],
  providers: [UpgradeCommand],
})
export class UpgradeVersionCommandModule {}
