import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspaceSuccessorModule } from 'src/engine/core-modules/user-workspace/user-workspace-successor.module';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { CoreWorkflowOwnershipTransferService } from 'src/engine/core-modules/workflow/services/core-workflow-ownership-transfer.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkflowEntity]),
    UserWorkspaceSuccessorModule,
    WorkspaceCacheModule,
  ],
  providers: [
    CoreWorkflowOwnershipTransferService,
    provideWorkspaceScopedRepository(WorkflowEntity),
  ],
  exports: [CoreWorkflowOwnershipTransferService],
})
export class CoreWorkflowOwnershipTransferModule {}
