import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSeedDemoWorkspaceService } from 'src/database/commands/data-seed-demo-workspace/services/data-seed-demo-workspace.service';
import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManagerModule } from 'src/engine/workspace-manager/workspace-manager.module';

@Module({
  imports: [
    WorkspaceManagerModule,
    EnvironmentModule,
    TypeOrmModule.forFeature([Workspace], 'core'),
  ],
  providers: [DataSeedDemoWorkspaceService],
  exports: [DataSeedDemoWorkspaceService],
})
export class DataSeedDemoWorkspaceModule {}
