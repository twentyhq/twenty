import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { V1_13_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-13/1-13-upgrade-version-command.module';
import { V1_14_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-14/1-14-upgrade-version-command.module';
import { V1_15_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-15/1-15-upgrade-version-command.module';
import { V1_16_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-16/1-16-upgrade-version-command.module';
import { V1_17_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-17/1-17-upgrade-version-command.module';
import { UpgradeCommand } from 'src/database/commands/upgrade-version-command/upgrade.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    V1_13_UpgradeVersionCommandModule,
    V1_14_UpgradeVersionCommandModule,
    V1_15_UpgradeVersionCommandModule,
    V1_16_UpgradeVersionCommandModule,
    V1_17_UpgradeVersionCommandModule,
    DataSourceModule,
  ],
  providers: [UpgradeCommand],
})
export class UpgradeVersionCommandModule {}
