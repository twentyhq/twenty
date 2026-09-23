import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommandShutdownModule } from 'src/database/commands/command-runners/command-shutdown.module';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    CommandShutdownModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
    WorkspaceCacheModule,
  ],
  providers: [WorkspaceIteratorService],
  exports: [WorkspaceIteratorService],
})
export class WorkspaceIteratorModule {}
