import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { RecordShareStorageModule } from 'src/engine/core-modules/record-share/record-share-storage.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { WorkflowRunRecordShareService } from 'src/engine/core-modules/workflow/services/workflow-run-record-share.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

// Run creation, workflow visibility changes and member removal all rewrite run
// grants, and those modules already depend on each other, so it lives on its own.
@Module({
  imports: [
    TypeOrmModule.forFeature([WorkflowEntity, UserWorkspaceEntity]),
    CacheLockModule,
    RecordShareStorageModule,
    WorkspaceCacheModule,
  ],
  providers: [
    WorkflowRunRecordShareService,
    provideWorkspaceScopedRepository(WorkflowEntity),
  ],
  exports: [WorkflowRunRecordShareService],
})
export class WorkflowRunRecordShareModule {}
