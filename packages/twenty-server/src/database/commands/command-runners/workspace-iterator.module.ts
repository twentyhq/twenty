import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommandShutdownModule } from 'src/database/commands/command-runners/command-shutdown.module';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [CommandShutdownModule, TypeOrmModule.forFeature([WorkspaceEntity])],
  providers: [WorkspaceIteratorService],
  exports: [WorkspaceIteratorService],
})
export class WorkspaceIteratorModule {}
