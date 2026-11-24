import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspaceSuccessorModule } from 'src/engine/core-modules/user-workspace/user-workspace-successor.module';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { PrivateCoreWorkflowSuccessorTransferService } from 'src/engine/core-modules/workflow/services/private-core-workflow-successor-transfer.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkflowEntity]),
    UserWorkspaceSuccessorModule,
    WorkspaceCacheModule,
  ],
  providers: [
    PrivateCoreWorkflowSuccessorTransferService,
    provideWorkspaceScopedRepository(WorkflowEntity),
  ],
  exports: [PrivateCoreWorkflowSuccessorTransferService],
})
export class PrivateCoreWorkflowSuccessorTransferModule {}
