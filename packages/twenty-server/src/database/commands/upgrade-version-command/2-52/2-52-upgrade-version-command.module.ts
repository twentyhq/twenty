import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { SeedWorkspaceFrontendDependenciesCommand } from 'src/database/commands/upgrade-version-command/2-52/2-52-workspace-command-1792761562238-seed-workspace-frontend-dependencies.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';

@Module({
  imports: [ApplicationModule, WorkspaceIteratorModule],
  providers: [SeedWorkspaceFrontendDependenciesCommand],
})
export class V2_52_UpgradeVersionCommandModule {}
