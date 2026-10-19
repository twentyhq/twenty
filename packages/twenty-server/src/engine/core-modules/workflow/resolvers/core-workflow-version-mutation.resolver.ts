import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { CoreWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.dto';
import { CreateCoreWorkflowVersionEdgeInput } from 'src/engine/core-modules/workflow/dtos/create-core-workflow-version-edge.input';
import { CreateCoreWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-core-workflow-version-step.input';
import { CreateDraftFromCoreWorkflowVersionInput } from 'src/engine/core-modules/workflow/dtos/create-draft-from-core-workflow-version.input';
import { DeleteCoreWorkflowVersionEdgeInput } from 'src/engine/core-modules/workflow/dtos/delete-core-workflow-version-edge.input';
import { DeleteCoreWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/delete-core-workflow-version-step.input';
import { DuplicateCoreWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/duplicate-core-workflow-version-step.input';
import { UpdateCoreWorkflowVersionPositionsInput } from 'src/engine/core-modules/workflow/dtos/update-core-workflow-version-positions.input';
import { UpdateCoreWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/update-core-workflow-version-step.input';
import { UpdateCoreWorkflowVersionTriggerInput } from 'src/engine/core-modules/workflow/dtos/update-core-workflow-version-trigger.input';
import { WorkflowActionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-action.dto';
import { WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
import { WorkflowVersionTriggerDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-trigger.dto';
import { WorkflowQueryValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-query-validation-graphql-api-exception.filter';
import { WorkflowTriggerGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-graphql-api-exception.filter';
import { WorkflowVersionEdgeGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-edge-graphql-api-exception.filter';
import { WorkflowVersionStepGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-step-graphql-api-exception.filter';
import { WorkflowVersionValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-validation-graphql-api-exception.filter';
import { CoreWorkflowLifecycleWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-lifecycle.workspace-service';
import { CoreWorkflowVersionMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-version-mutation.workspace-service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@CoreResolver()
@UsePipes(ResolverValidationPipe)
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: true,
    application: false,
  }),
  SettingsPermissionGuard(PermissionFlagType.WORKFLOWS),
)
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  WorkflowQueryValidationGraphqlApiExceptionFilter,
  WorkflowTriggerGraphqlApiExceptionFilter,
  WorkflowVersionEdgeGraphqlApiExceptionFilter,
  WorkflowVersionStepGraphqlApiExceptionFilter,
  WorkflowVersionValidationGraphqlApiExceptionFilter,
)
export class CoreWorkflowVersionMutationResolver {
  constructor(
    private readonly coreWorkflowVersionMutationWorkspaceService: CoreWorkflowVersionMutationWorkspaceService,
    private readonly coreWorkflowLifecycleWorkspaceService: CoreWorkflowLifecycleWorkspaceService,
  ) {}

  @Mutation(() => Boolean)
  async activateCoreWorkflowVersion(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Args('coreWorkflowVersionId', { type: () => UUIDScalarType })
    coreWorkflowVersionId: string,
  ): Promise<boolean> {
    return this.coreWorkflowLifecycleWorkspaceService.activateCoreWorkflowVersion(
      {
        workspaceId,

        userWorkspaceId,
        coreWorkflowVersionId,
      },
    );
  }

  @Mutation(() => Boolean)
  async deactivateCoreWorkflowVersion(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Args('coreWorkflowVersionId', { type: () => UUIDScalarType })
    coreWorkflowVersionId: string,
  ): Promise<boolean> {
    return this.coreWorkflowLifecycleWorkspaceService.deactivateCoreWorkflowVersion(
      {
        workspaceId,

        userWorkspaceId,
        coreWorkflowVersionId,
      },
    );
  }

  @Mutation(() => CoreWorkflowVersionDTO)
  async createDraftFromCoreWorkflowVersion(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Args('input')
    {
      coreWorkflowId,
      coreWorkflowVersionIdToCopy,
    }: CreateDraftFromCoreWorkflowVersionInput,
  ): Promise<CoreWorkflowVersionDTO> {
    return this.coreWorkflowVersionMutationWorkspaceService.createDraftFromCoreWorkflowVersion(
      {
        workspaceId,

        userWorkspaceId,
        coreWorkflowId,
        coreWorkflowVersionIdToCopy,
      },
    );
  }

  @Mutation(() => WorkflowVersionStepChangesDTO)
  async createCoreWorkflowVersionStep(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Args('input') input: CreateCoreWorkflowVersionStepInput,
  ): Promise<WorkflowVersionStepChangesDTO> {
    return this.coreWorkflowVersionMutationWorkspaceService.createStep({
      workspaceId,

      userWorkspaceId,
      input,
    });
  }

  @Mutation(() => WorkflowActionDTO)
  async updateCoreWorkflowVersionStep(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Args('input')
    { coreWorkflowVersionId, step }: UpdateCoreWorkflowVersionStepInput,
  ): Promise<WorkflowActionDTO> {
    return this.coreWorkflowVersionMutationWorkspaceService.updateStep({
      workspaceId,

      userWorkspaceId,
      coreWorkflowVersionId,
      step,
    });
  }

  @Mutation(() => WorkflowVersionTriggerDTO)
  async updateCoreWorkflowVersionTrigger(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Args('input')
    { coreWorkflowVersionId, trigger }: UpdateCoreWorkflowVersionTriggerInput,
  ): Promise<WorkflowVersionTriggerDTO> {
    return this.coreWorkflowVersionMutationWorkspaceService.updateTrigger({
      workspaceId,

      userWorkspaceId,
      coreWorkflowVersionId,
      trigger,
    });
  }

  @Mutation(() => WorkflowVersionStepChangesDTO)
  async deleteCoreWorkflowVersionStep(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Args('input')
    { coreWorkflowVersionId, stepId }: DeleteCoreWorkflowVersionStepInput,
  ): Promise<WorkflowVersionStepChangesDTO> {
    return this.coreWorkflowVersionMutationWorkspaceService.deleteStep({
      workspaceId,

      userWorkspaceId,
      coreWorkflowVersionId,
      stepIdToDelete: stepId,
    });
  }

  @Mutation(() => WorkflowVersionStepChangesDTO)
  async duplicateCoreWorkflowVersionStep(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Args('input')
    { coreWorkflowVersionId, stepId }: DuplicateCoreWorkflowVersionStepInput,
  ): Promise<WorkflowVersionStepChangesDTO> {
    return this.coreWorkflowVersionMutationWorkspaceService.duplicateStep({
      workspaceId,

      userWorkspaceId,
      coreWorkflowVersionId,
      stepId,
    });
  }

  @Mutation(() => WorkflowVersionStepChangesDTO)
  async createCoreWorkflowVersionEdge(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Args('input')
    {
      coreWorkflowVersionId,
      source,
      target,
      sourceConnectionOptions,
    }: CreateCoreWorkflowVersionEdgeInput,
  ): Promise<WorkflowVersionStepChangesDTO> {
    return this.coreWorkflowVersionMutationWorkspaceService.createEdge({
      workspaceId,

      userWorkspaceId,
      coreWorkflowVersionId,
      source,
      target,
      sourceConnectionOptions,
    });
  }

  @Mutation(() => WorkflowVersionStepChangesDTO)
  async deleteCoreWorkflowVersionEdge(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Args('input')
    {
      coreWorkflowVersionId,
      source,
      target,
      sourceConnectionOptions,
    }: DeleteCoreWorkflowVersionEdgeInput,
  ): Promise<WorkflowVersionStepChangesDTO> {
    return this.coreWorkflowVersionMutationWorkspaceService.deleteEdge({
      workspaceId,

      userWorkspaceId,
      coreWorkflowVersionId,
      source,
      target,
      sourceConnectionOptions,
    });
  }

  @Mutation(() => Boolean)
  async updateCoreWorkflowVersionPositions(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Args('input')
    {
      coreWorkflowVersionId,
      positions,
    }: UpdateCoreWorkflowVersionPositionsInput,
  ): Promise<boolean> {
    await this.coreWorkflowVersionMutationWorkspaceService.updatePositions({
      workspaceId,

      userWorkspaceId,
      coreWorkflowVersionId,
      positions,
    });

    return true;
  }
}
