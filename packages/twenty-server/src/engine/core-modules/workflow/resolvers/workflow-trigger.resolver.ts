import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { WorkflowRunDTO } from 'src/engine/core-modules/workflow/dtos/workflow-run.dto';
import { WorkflowQueryValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-query-validation-graphql-api-exception.filter';
import { WorkflowTriggerGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-graphql-api-exception.filter';
import { WorkflowVersionValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-validation-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';

@CoreResolver()
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
  SettingsPermissionGuard(PermissionFlagType.WORKFLOWS),
)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  WorkflowTriggerGraphqlApiExceptionFilter,
  WorkflowQueryValidationGraphqlApiExceptionFilter,
  WorkflowVersionValidationGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  AuthGraphqlApiExceptionFilter,
)
export class WorkflowTriggerResolver {
  constructor(
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
  ) {}

  @Mutation(() => WorkflowRunDTO)
  async stopWorkflowRun(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('workflowRunId', { type: () => UUIDScalarType })
    workflowRunId: string,
  ) {
    return this.workflowRunnerWorkspaceService.stopWorkflowRun(
      workspace.id,
      workflowRunId,
    );
  }

  @Mutation(() => WorkflowRunDTO)
  async retryWorkflowRun(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('workflowRunId', { type: () => UUIDScalarType })
    workflowRunId: string,
  ) {
    return this.workflowRunnerWorkspaceService.retryWorkflowRun(
      workspace.id,
      workflowRunId,
    );
  }
}
