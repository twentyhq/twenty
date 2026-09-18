import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { CoreWorkflowActorWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-actor.workspace-service';
import { CoreWorkflowIdResolutionService } from 'src/engine/core-modules/workflow/services/core-workflow-id-resolution.service';
import { CoreWorkflowLifecycleWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-lifecycle.workspace-service';
import { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import { CoreWorkflowMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-mutation.workspace-service';
import { CoreWorkflowVersionListService } from 'src/engine/core-modules/workflow/services/core-workflow-version-list.service';
import { CoreWorkflowVersionMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-version-mutation.workspace-service';
import { CoreWorkflowVersionWriteService } from 'src/engine/core-modules/workflow/services/core-workflow-version-write.service';
import { WorkflowCoreModule } from 'src/engine/core-modules/workflow/workflow-core.module';
import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CommandMenuItemModule } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';
import { WorkflowBuilderModule } from 'src/modules/workflow/workflow-builder/workflow-builder.module';
import { WorkflowVersionValidationModule } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-version-validation.module';
import { CodeStepBuildModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/code-step-build.module';
import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';
import { AutomatedTriggerModule } from 'src/modules/workflow/workflow-trigger/automated-trigger/automated-trigger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity, WorkflowVersionEntity]),
    AutomatedTriggerModule,
    CacheLockModule,
    CacheStorageModule,
    CodeStepBuildModule,
    CommandMenuItemModule,
    RecordPositionModule,
    WorkflowBuilderModule,
    WorkflowCommonModule,
    WorkflowCoreModule,
    WorkflowMetadataReadModule,
    WorkflowRunnerModule,
    WorkflowVersionCoreModule,
    WorkflowVersionValidationModule,
  ],
  providers: [
    CoreWorkflowActorWorkspaceService,
    CoreWorkflowIdResolutionService,
    CoreWorkflowLifecycleWorkspaceService,
    CoreWorkflowListService,
    CoreWorkflowMutationWorkspaceService,
    CoreWorkflowVersionListService,
    CoreWorkflowVersionMutationWorkspaceService,
    CoreWorkflowVersionWriteService,
    provideWorkspaceScopedRepository(WorkflowVersionEntity),
    provideWorkspaceScopedRepository(WorkflowEntity),
  ],
  exports: [
    CoreWorkflowActorWorkspaceService,
    CoreWorkflowIdResolutionService,
    CoreWorkflowLifecycleWorkspaceService,
    CoreWorkflowListService,
    CoreWorkflowMutationWorkspaceService,
    CoreWorkflowVersionListService,
    CoreWorkflowVersionMutationWorkspaceService,
    CoreWorkflowVersionWriteService,
  ],
})
export class CoreWorkflowServicesModule {}
