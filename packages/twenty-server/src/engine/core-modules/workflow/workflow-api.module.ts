import { GettingStartedHandoverResolver } from 'src/engine/core-modules/getting-started/getting-started-handover.resolver';
import { GettingStartedModule } from 'src/engine/core-modules/getting-started/getting-started.module';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';
import { Module } from '@nestjs/common';

import { WorkflowVersionValidationModule } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-version-validation.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { WorkflowTriggerController } from 'src/engine/core-modules/workflow/controllers/workflow-trigger.controller';
import { CoreWorkflowResolver } from 'src/engine/core-modules/workflow/resolvers/core-workflow.resolver';
import { CoreWorkflowRunResolver } from 'src/engine/core-modules/workflow/resolvers/core-workflow-run.resolver';
import { CoreWorkflowVersionMutationResolver } from 'src/engine/core-modules/workflow/resolvers/core-workflow-version-mutation.resolver';
import { WorkflowBuilderResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-builder.resolver';
import { WorkflowTriggerResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-trigger.resolver';
import { WorkflowVersionStepResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-version-step.resolver';
import { CoreWorkflowAccessModule } from 'src/engine/core-modules/workflow/core-workflow-access.module';
import { CoreWorkflowServicesModule } from 'src/engine/core-modules/workflow/core-workflow-services.module';
import { WorkflowCoreModule } from 'src/engine/core-modules/workflow/workflow-core.module';
import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowBuilderModule } from 'src/modules/workflow/workflow-builder/workflow-builder.module';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';

@Module({
  imports: [
    GettingStartedModule,
    UserVarsModule,
    CacheLockModule,
    WorkflowMetadataReadModule,
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      WorkflowVersionEntity,
      ConnectedAccountEntity,
    ]),
    CoreWorkflowAccessModule,
    WorkflowCoreModule,
    WorkflowTriggerModule,
    WorkflowBuilderModule,
    WorkflowCommonModule,
    WorkflowRunModule,
    WorkflowRunnerModule,
    PermissionsModule,
    ToolModule,
    ConnectedAccountMetadataModule,
    WorkflowVersionCoreModule,
    WorkflowVersionValidationModule,
    CoreWorkflowServicesModule,
  ],
  controllers: [WorkflowTriggerController],
  providers: [
    GettingStartedHandoverResolver,
    WorkflowTriggerResolver,
    WorkflowBuilderResolver,
    WorkflowVersionStepResolver,
    CoreWorkflowResolver,
    CoreWorkflowVersionMutationResolver,
    CoreWorkflowRunResolver,
    provideWorkspaceScopedRepository(WorkflowVersionEntity),
  ],
})
export class WorkflowApiModule {}
