import { CoreWorkflowMigrationWriteModule } from 'src/engine/core-modules/workflow/core-workflow-migration-write.module';
import { Module } from '@nestjs/common';

import { WorkflowVersionValidationModule } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-version-validation.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { WorkflowTriggerController } from 'src/engine/core-modules/workflow/controllers/workflow-trigger.controller';
import { CoreWorkflowResolver } from 'src/engine/core-modules/workflow/resolvers/core-workflow.resolver';
import { CoreWorkflowVersionMutationResolver } from 'src/engine/core-modules/workflow/resolvers/core-workflow-version-mutation.resolver';
import { WorkflowBuilderResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-builder.resolver';
import { WorkflowTriggerResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-trigger.resolver';
import { WorkflowVersionEdgeResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-version-edge.resolver';
import { WorkflowVersionStepResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-version-step.resolver';
import { WorkflowVersionResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-version.resolver';
import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { CoreWorkflowIdResolutionService } from 'src/engine/core-modules/workflow/services/core-workflow-id-resolution.service';
import { CoreWorkflowLifecycleWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-lifecycle.workspace-service';
import { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import { CoreWorkflowMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-mutation.workspace-service';
import { CoreWorkflowVersionMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-version-mutation.workspace-service';
import { CoreWorkflowVersionWriteService } from 'src/engine/core-modules/workflow/services/core-workflow-version-write.service';
import { WorkflowCoreModule } from 'src/engine/core-modules/workflow/workflow-core.module';
import { CoreWorkflowVersionListService } from 'src/engine/core-modules/workflow/services/core-workflow-version-list.service';
import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { CommandMenuItemModule } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.module';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';
import { WorkflowBuilderModule } from 'src/modules/workflow/workflow-builder/workflow-builder.module';
import { CodeStepBuildModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/code-step-build.module';
import { WorkflowVersionModule } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.module';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';
import { AutomatedTriggerModule } from 'src/modules/workflow/workflow-trigger/automated-trigger/automated-trigger.module';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';

@Module({
  imports: [
    CoreWorkflowMigrationWriteModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    TypeOrmModule.forFeature([WorkspaceEntity, WorkflowVersionEntity]),
    RecordPositionModule,
    AutomatedTriggerModule,
    CacheLockModule,
    CacheStorageModule,
    CommandMenuItemModule,
    WorkflowCoreModule,
    WorkflowTriggerModule,
    WorkflowBuilderModule,
    WorkflowCommonModule,
    WorkflowMetadataReadModule,
    WorkflowVersionModule,
    WorkflowRunModule,
    WorkflowRunnerModule,
    PermissionsModule,
    ToolModule,
    LogicFunctionModule,
    CodeStepBuildModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ConnectedAccountMetadataModule,
    WorkflowVersionCoreModule,
    WorkflowVersionValidationModule,
  ],
  controllers: [WorkflowTriggerController],
  providers: [
    WorkflowTriggerResolver,
    WorkflowBuilderResolver,
    WorkflowVersionStepResolver,
    WorkflowVersionEdgeResolver,
    WorkflowVersionResolver,
    CoreWorkflowResolver,
    CoreWorkflowVersionMutationResolver,
    CoreWorkflowIdResolutionService,
    CoreWorkflowLifecycleWorkspaceService,
    CoreWorkflowListService,
    CoreWorkflowMutationWorkspaceService,
    CoreWorkflowVersionMutationWorkspaceService,
    CoreWorkflowVersionWriteService,
    CoreWorkflowVersionListService,
    provideWorkspaceScopedRepository(WorkflowVersionEntity),
    provideWorkspaceScopedRepository(WorkflowEntity),
  ],
})
export class WorkflowApiModule {}
