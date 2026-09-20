import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { CreateWorkflowVersionEdgeInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-edge.input';
import { WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
import { WorkflowVersionValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-validation-graphql-api-exception.filter';
import { WorkflowVersionEdgeGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-edge-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { WorkflowVersionEdgeWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.workspace-service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';

@CoreResolver()
@UsePipes(ResolverValidationPipe)
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKFLOWS),
)
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  WorkflowVersionEdgeGraphqlApiExceptionFilter,
  WorkflowVersionValidationGraphqlApiExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
export class WorkflowVersionEdgeResolver {
  constructor(
    private readonly workflowVersionEdgeWorkspaceService: WorkflowVersionEdgeWorkspaceService,
    private readonly coreWorkflowAccessService: CoreWorkflowAccessService,
  ) {}

  @Mutation(() => WorkflowVersionStepChangesDTO)
  async createWorkflowVersionEdge(
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input')
    {
      source,
      target,
      workflowVersionId,
      sourceConnectionOptions,
    }: CreateWorkflowVersionEdgeInput,
  ): Promise<WorkflowVersionStepChangesDTO> {
    await this.coreWorkflowAccessService.assertWorkspaceWorkflowVersionsAreAccessibleOrThrow(
      {
        workspaceId,
        userWorkspaceId,
        workspaceWorkflowVersionIds: [workflowVersionId],
      },
    );

    return this.workflowVersionEdgeWorkspaceService.createWorkflowVersionEdge({
      source,
      target,
      workflowVersionId,
      workspaceId,
      sourceConnectionOptions,
    });
  }

  @Mutation(() => WorkflowVersionStepChangesDTO)
  async deleteWorkflowVersionEdge(
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input')
    {
      source,
      target,
      workflowVersionId,
      sourceConnectionOptions,
    }: CreateWorkflowVersionEdgeInput,
  ): Promise<WorkflowVersionStepChangesDTO> {
    await this.coreWorkflowAccessService.assertWorkspaceWorkflowVersionsAreAccessibleOrThrow(
      {
        workspaceId,
        userWorkspaceId,
        workspaceWorkflowVersionIds: [workflowVersionId],
      },
    );

    return this.workflowVersionEdgeWorkspaceService.deleteWorkflowVersionEdge({
      source,
      target,
      workflowVersionId,
      workspaceId,
      sourceConnectionOptions,
    });
  }
}
