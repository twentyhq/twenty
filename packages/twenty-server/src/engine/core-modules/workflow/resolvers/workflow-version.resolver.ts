import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { CreateDraftFromWorkflowVersionInput } from 'src/engine/core-modules/workflow/dtos/create-draft-from-workflow-version-input.dto';
import { DuplicateWorkflowInput } from 'src/engine/core-modules/workflow/dtos/duplicate-workflow-input.dto';
import { UpdateWorkflowVersionPositionsInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-version-positions-input.dto';
import { WorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version.dto';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { WorkflowVersionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.workspace-service';

@Resolver()
@UsePipes(ResolverValidationPipe)
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKFLOWS),
)
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class WorkflowVersionResolver {
  constructor(
    private readonly workflowVersionWorkspaceService: WorkflowVersionWorkspaceService,
  ) {}

  @Mutation(() => WorkflowVersionDTO)
  async createDraftFromWorkflowVersion(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input')
    {
      workflowId,
      workflowVersionIdToCopy,
    }: CreateDraftFromWorkflowVersionInput,
  ): Promise<WorkflowVersionDTO> {
    return this.workflowVersionWorkspaceService.createDraftFromWorkflowVersion({
      workspaceId,
      workflowId,
      workflowVersionIdToCopy,
    });
  }

  @Mutation(() => WorkflowVersionDTO)
  async duplicateWorkflow(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input')
    { workflowIdToDuplicate, workflowVersionIdToCopy }: DuplicateWorkflowInput,
  ): Promise<WorkflowVersionDTO> {
    return this.workflowVersionWorkspaceService.duplicateWorkflow({
      workspaceId,
      workflowIdToDuplicate,
      workflowVersionIdToCopy,
    });
  }

  @Mutation(() => Boolean)
  async updateWorkflowVersionPositions(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input')
    { workflowVersionId, positions }: UpdateWorkflowVersionPositionsInput,
  ) {
    await this.workflowVersionWorkspaceService.updateWorkflowVersionPositions({
      workspaceId,
      workflowVersionId,
      positions,
    });

    return true;
  }
}
