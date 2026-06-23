import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { CleanupOrphanedUserWorkspacesCommand } from 'src/database/commands/upgrade-version-command/2-16/2-16-workspace-command-1802000000000-cleanup-orphaned-user-workspaces.command';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { GlobalWorkspaceDataSourceModule } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.module';

@Module({
  imports: [
    WorkspaceIteratorModule,
    UserWorkspaceModule,
    GlobalWorkspaceDataSourceModule,
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
  ],
  providers: [CleanupOrphanedUserWorkspacesCommand],
})
export class V2_16_UpgradeVersionCommandModule {}
