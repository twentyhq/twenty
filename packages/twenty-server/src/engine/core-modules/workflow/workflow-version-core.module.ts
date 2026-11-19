import { Module } from '@nestjs/common';

import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { FlatWorkflowVersionModule } from 'src/engine/metadata-modules/flat-workflow-version/flat-workflow-version.module';
import { CoreWorkflowTriggerService } from 'src/engine/core-modules/workflow/services/core-workflow-trigger.service';
import { WorkspaceWorkflowAutomatedTriggerMapCacheService } from 'src/engine/core-modules/workflow/services/workspace-workflow-automated-trigger-map-cache.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';

@Module({
  imports: [
    RecordPositionModule,
    TypeOrmModule.forFeature([WorkflowVersionEntity, WorkspaceEntity]),
    WorkspaceCacheModule,
    FlatWorkflowVersionModule,
    WorkflowMetadataReadModule,
  ],
  providers: [
    WorkspaceWorkflowAutomatedTriggerMapCacheService,
    CoreWorkflowTriggerService,
    provideWorkspaceScopedRepository(WorkflowVersionEntity),
  ],
  exports: [TypeOrmModule, CoreWorkflowTriggerService],
})
export class WorkflowVersionCoreModule {}
