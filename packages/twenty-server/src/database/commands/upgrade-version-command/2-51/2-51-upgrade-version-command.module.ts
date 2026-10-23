import { Module } from '@nestjs/common';
import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { SeedWorkspaceFrontendDependenciesCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792743722572-seed-workspace-frontend-dependencies.command';

@Module({
  imports: [ApplicationModule, WorkspaceIteratorModule],
  providers: [SeedWorkspaceFrontendDependenciesCommand],
})
export class V2_51_UpgradeVersionCommandModule {}
