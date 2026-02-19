import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { V1_17_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-17/1-17-upgrade-version-command.module';
import { V1_18_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-18/1-18-upgrade-version-command.module';
import { V1_19_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-19/1-19-upgrade-version-command.module';
import { UpgradeCommand } from 'src/database/commands/upgrade-version-command/upgrade.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    V1_17_UpgradeVersionCommandModule,
    V1_18_UpgradeVersionCommandModule,
    V1_19_UpgradeVersionCommandModule,
    DataSourceModule,
  ],
  providers: [UpgradeCommand],
})
export class UpgradeVersionCommandModule {}
