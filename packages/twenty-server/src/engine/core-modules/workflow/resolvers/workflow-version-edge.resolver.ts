import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { CreateWorkflowVersionEdgeInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-edge-input.dto';
import { WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
import { WorkflowVersionEdgeWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.workspace-service';

@Resolver()
@UsePipes(ResolverValidationPipe)
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  SettingsPermissionsGuard(PermissionFlagType.WORKFLOWS),
)
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class WorkflowVersionEdgeResolver {
  constructor(
    private readonly workflowVersionEdgeWorkspaceService: WorkflowVersionEdgeWorkspaceService,
  ) {}

  @Mutation(() => WorkflowVersionStepChangesDTO)
  async createWorkflowVersionEdge(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('input')
    { source, target, workflowVersionId }: CreateWorkflowVersionEdgeInput,
  ): Promise<WorkflowVersionStepChangesDTO> {
    return this.workflowVersionEdgeWorkspaceService.createWorkflowVersionEdge({
      source,
      target,
      workflowVersionId,
      workspaceId,
    });
  }

  @Mutation(() => WorkflowVersionStepChangesDTO)
  async deleteWorkflowVersionEdge(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('input')
    { source, target, workflowVersionId }: CreateWorkflowVersionEdgeInput,
  ): Promise<WorkflowVersionStepChangesDTO> {
    return this.workflowVersionEdgeWorkspaceService.deleteWorkflowVersionEdge({
      source,
      target,
      workflowVersionId,
      workspaceId,
    });
  }
}
