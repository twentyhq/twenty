import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { V0_43_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/0-43/0-43-upgrade-version-command.module';
import { UpgradeCommand } from 'src/database/commands/upgrade-version-command/upgrade.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    V0_43_UpgradeVersionCommandModule,
  ],
  providers: [UpgradeCommand],
})
export class UpgradeVersionCommandModule {}
