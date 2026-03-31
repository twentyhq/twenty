import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { V1_20_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-20/1-20-upgrade-version-command.module';
import { V1_21_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-21/1-21-upgrade-version-command.module';
import { UpgradeCommand } from 'src/database/commands/upgrade-version-command/upgrade.command';
import { CoreEngineVersionModule } from 'src/engine/core-engine-version/core-engine-version.module';
import { CoreMigrationRunnerModule } from 'src/database/commands/core-migration-runner/core-migration-runner.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceVersionModule } from 'src/engine/workspace-manager/workspace-version/workspace-version.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    V1_20_UpgradeVersionCommandModule,
    V1_21_UpgradeVersionCommandModule,
    DataSourceModule,
    CoreEngineVersionModule,
    CoreMigrationRunnerModule,
    WorkspaceVersionModule,
  ],
  providers: [UpgradeCommand],
})
export class UpgradeVersionCommandModule {}
