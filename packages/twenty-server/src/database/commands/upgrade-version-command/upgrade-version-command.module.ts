import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { V0_54_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/0-54/0-54-upgrade-version-command.module';
import { V0_55_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/0-55/0-55-upgrade-version-command.module';
import { V1_1_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-1/1-1-upgrade-version-command.module';
import { V1_2_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-2/1-2-upgrade-version-command.module';
import { V1_3_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-3/1-3-upgrade-version-command.module';
import { V1_5_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-5/1-5-upgrade-version-command.module';
import { V1_6_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-6/1-6-upgrade-version-command.module';
import { UpgradeCommand } from 'src/database/commands/upgrade-version-command/upgrade.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceSyncMetadataModule } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace]),
    V0_54_UpgradeVersionCommandModule,
    V0_55_UpgradeVersionCommandModule,
    V1_1_UpgradeVersionCommandModule,
    V1_2_UpgradeVersionCommandModule,
    V1_3_UpgradeVersionCommandModule,
    V1_5_UpgradeVersionCommandModule,
    V1_6_UpgradeVersionCommandModule,
    WorkspaceSyncMetadataModule,
  ],
  providers: [UpgradeCommand],
})
export class UpgradeVersionCommandModule {}
