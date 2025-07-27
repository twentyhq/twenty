import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { CreateDraftFromWorkflowVersionInput } from 'src/engine/core-modules/workflow/dtos/create-draft-from-workflow-version-input.dto';
import { WorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version.dto';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { WorkflowVersionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.workspace-service';
import { UpdateDraftWorkflowVersionPositionsInput } from 'src/engine/core-modules/workflow/dtos/update-draft-workflow-version-positions-input.dto';

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
export class WorkflowVersionResolver {
  constructor(
    private readonly workflowVersionWorkspaceService: WorkflowVersionWorkspaceService,
  ) {}

  @Mutation(() => WorkflowVersionDTO)
  async createDraftFromWorkflowVersion(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('input')
    {
      workflowId,
      workflowVersionIdToCopy,
    }: CreateDraftFromWorkflowVersionInput,
  ): Promise<WorkflowVersionDTO> {
    return {
      id: await this.workflowVersionWorkspaceService.createDraftFromWorkflowVersion(
        {
          workspaceId,
          workflowId,
          workflowVersionIdToCopy,
        },
      ),
    };
  }

  @Mutation(() => Boolean)
  async updateDraftWorkflowVersionPositions(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('input')
    { workflowVersionId, positions }: UpdateDraftWorkflowVersionPositionsInput,
  ) {
    await this.workflowVersionWorkspaceService.updateDraftWorkflowVersionPositions(
      {
        workspaceId,
        workflowVersionId,
        positions,
      },
    );

    return true;
  }
}
