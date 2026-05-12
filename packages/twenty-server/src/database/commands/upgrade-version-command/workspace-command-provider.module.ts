import { Module } from '@nestjs/common';

import { V1_21_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-21/1-21-upgrade-version-command.module';
import { V1_22_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-22/1-22-upgrade-version-command.module';
import { V1_23_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-23/1-23-upgrade-version-command.module';
import { V2_0_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/2-0/2-0-upgrade-version-command.module';
import { V2_1_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/2-1/2-1-upgrade-version-command.module';
import { V2_2_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/2-2/2-2-upgrade-version-command.module';
import { V2_3_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/2-3/2-3-upgrade-version-command.module';
import { V2_4_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/2-4/2-4-upgrade-version-command.module';

@Module({
  imports: [
    V1_21_UpgradeVersionCommandModule,
    V1_22_UpgradeVersionCommandModule,
    V1_23_UpgradeVersionCommandModule,
    V2_0_UpgradeVersionCommandModule,
    V2_1_UpgradeVersionCommandModule,
    V2_2_UpgradeVersionCommandModule,
    V2_3_UpgradeVersionCommandModule,
    V2_4_UpgradeVersionCommandModule,
  ],
})
export class WorkspaceCommandProviderModule {}
