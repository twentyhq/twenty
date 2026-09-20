import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { CoreWorkflowConnectionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-connection.dto';
import { CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
import { CoreWorkflowWithCurrentVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-with-current-version.dto';
import { CoreWorkflowsWithCurrentVersionsInput } from 'src/engine/core-modules/workflow/dtos/core-workflows-with-current-versions.input';
import { CreateCoreWorkflowInput } from 'src/engine/core-modules/workflow/dtos/create-core-workflow.input';
import { DeletedCoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/deleted-core-workflow.dto';
import { DeleteCoreWorkflowsInput } from 'src/engine/core-modules/workflow/dtos/delete-core-workflows.input';
import { DiscardCoreWorkflowDraftInput } from 'src/engine/core-modules/workflow/dtos/discard-core-workflow-draft.input';
import { WorkflowQueryValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-query-validation-graphql-api-exception.filter';
import { CoreWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.dto';
import { CoreWorkflowVersionArgs } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.input';
import { CoreWorkflowVersionsArgs } from 'src/engine/core-modules/workflow/dtos/core-workflow-versions.input';
import { CoreWorkflowVersionByIdArgs } from 'src/engine/core-modules/workflow/dtos/core-workflow-version-by-id.input';
import { CoreWorkflowVersionsByCoreWorkflowIdArgs } from 'src/engine/core-modules/workflow/dtos/core-workflow-versions-by-core-workflow-id.input';
import { CoreWorkflowByIdArgs } from 'src/engine/core-modules/workflow/dtos/core-workflow-by-id.input';
import { CoreWorkflowArgs } from 'src/engine/core-modules/workflow/dtos/core-workflow.input';
import { DuplicateCoreWorkflowInput } from 'src/engine/core-modules/workflow/dtos/duplicate-core-workflow.input';
import { UpdateCoreWorkflowInput } from 'src/engine/core-modules/workflow/dtos/update-core-workflow.input';
import { UpdateCoreWorkflowVisibilityInput } from 'src/engine/core-modules/workflow/dtos/update-core-workflow-visibility.input';
import { CoreWorkflowsArgs } from 'src/engine/core-modules/workflow/dtos/core-workflows.input';
import { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import { CoreWorkflowMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-mutation.workspace-service';
import { CoreWorkflowVersionListService } from 'src/engine/core-modules/workflow/services/core-workflow-version-list.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { isDefined } from 'twenty-shared/utils';

import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@CoreResolver()
@UsePipes(ResolverValidationPipe)
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKFLOWS),
)
@UseFilters(
  WorkflowQueryValidationGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  AuthGraphqlApiExceptionFilter,
)
export class CoreWorkflowResolver {
  constructor(
    private readonly coreWorkflowListService: CoreWorkflowListService,
    private readonly coreWorkflowMutationWorkspaceService: CoreWorkflowMutationWorkspaceService,
    private readonly coreWorkflowVersionListService: CoreWorkflowVersionListService,
  ) {}

  @Mutation(() => CoreWorkflowDTO, { nullable: true })
  async updateCoreWorkflow(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('input') input: UpdateCoreWorkflowInput,
  ): Promise<CoreWorkflowDTO | null> {
    await this.coreWorkflowMutationWorkspaceService.updateWorkflow(
      workspaceId,
      userWorkspaceId,
      input,
    );

    return this.coreWorkflowListService.findOneById({
      workspaceId,
      userWorkspaceId,
      coreWorkflowId: input.coreWorkflowId,
    });
  }

  @Mutation(() => CoreWorkflowDTO, { nullable: true })
  async updateCoreWorkflowVisibility(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('input') input: UpdateCoreWorkflowVisibilityInput,
  ): Promise<CoreWorkflowDTO | null> {
    return this.coreWorkflowMutationWorkspaceService.updateWorkflowVisibility(
      workspaceId,
      userWorkspaceId,
      input,
    );
  }

  @Mutation(() => CoreWorkflowDTO)
  async duplicateCoreWorkflow(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthUser() user: AuthContextUser,
    @Args('input')
    {
      coreWorkflowIdToDuplicate,
      coreWorkflowVersionIdToCopy,
    }: DuplicateCoreWorkflowInput,
  ): Promise<CoreWorkflowDTO> {
    return this.coreWorkflowMutationWorkspaceService.duplicateWorkflow({
      workspaceId,
      userWorkspaceId,
      user,
      coreWorkflowIdToDuplicate,
      coreWorkflowVersionIdToCopy,
    });
  }

  @Mutation(() => CoreWorkflowDTO)
  async createCoreWorkflow(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthUser() user: AuthContextUser,
    @Args('input') input: CreateCoreWorkflowInput,
  ): Promise<CoreWorkflowDTO> {
    return this.coreWorkflowMutationWorkspaceService.createWorkflow(
      workspaceId,
      userWorkspaceId,
      user,
      input,
    );
  }

  @Mutation(() => [DeletedCoreWorkflowDTO])
  async deleteCoreWorkflows(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('input') input: DeleteCoreWorkflowsInput,
  ): Promise<DeletedCoreWorkflowDTO[]> {
    return this.coreWorkflowMutationWorkspaceService.deleteWorkflows(
      workspaceId,
      userWorkspaceId,
      input,
    );
  }

  @Mutation(() => CoreWorkflowDTO, { nullable: true })
  async discardCoreWorkflowDraft(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('input') input: DiscardCoreWorkflowDraftInput,
  ): Promise<CoreWorkflowDTO | null> {
    const coreWorkflowId =
      await this.coreWorkflowMutationWorkspaceService.discardDraftVersion(
        workspaceId,
        userWorkspaceId,
        input,
      );

    if (!isDefined(coreWorkflowId)) {
      return null;
    }

    return this.coreWorkflowListService.findOneById({
      workspaceId,
      userWorkspaceId,
      coreWorkflowId,
    });
  }

  @Query(() => CoreWorkflowConnectionDTO)
  async coreWorkflows(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args() coreWorkflowsArgs: CoreWorkflowsArgs,
  ): Promise<CoreWorkflowConnectionDTO> {
    return this.coreWorkflowListService.findManyByWorkspaceId(
      workspaceId,
      userWorkspaceId,
      coreWorkflowsArgs,
    );
  }

  @Query(() => CoreWorkflowDTO, { nullable: true })
  async coreWorkflowById(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args() { coreWorkflowId }: CoreWorkflowByIdArgs,
  ): Promise<CoreWorkflowDTO | null> {
    return this.coreWorkflowListService.findOneById({
      workspaceId,
      userWorkspaceId,
      coreWorkflowId,
    });
  }

  @Query(() => [CoreWorkflowWithCurrentVersionDTO])
  async coreWorkflowsWithCurrentVersions(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('input') { coreWorkflowIds }: CoreWorkflowsWithCurrentVersionsInput,
  ): Promise<CoreWorkflowWithCurrentVersionDTO[]> {
    return this.coreWorkflowListService.findManyWithCurrentVersions({
      workspaceId,
      userWorkspaceId,
      coreWorkflowIds,
    });
  }

  @Query(() => CoreWorkflowDTO, { nullable: true })
  async coreWorkflow(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args() { workspaceWorkflowId }: CoreWorkflowArgs,
  ): Promise<CoreWorkflowDTO | null> {
    return this.coreWorkflowListService.findOneByWorkspaceWorkflowId({
      workspaceId,
      userWorkspaceId,
      workspaceWorkflowId,
    });
  }

  @Query(() => [CoreWorkflowVersionDTO])
  async coreWorkflowVersions(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args() { workspaceWorkflowId }: CoreWorkflowVersionsArgs,
  ): Promise<CoreWorkflowVersionDTO[]> {
    return this.coreWorkflowVersionListService.findManyByWorkspaceWorkflowId({
      workspaceId,
      userWorkspaceId,
      workspaceWorkflowId,
    });
  }

  @Query(() => CoreWorkflowVersionDTO, { nullable: true })
  async coreWorkflowVersion(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args() { workspaceWorkflowVersionId }: CoreWorkflowVersionArgs,
  ): Promise<CoreWorkflowVersionDTO | null> {
    return this.coreWorkflowVersionListService.findOneByWorkspaceWorkflowVersionId(
      {
        workspaceId,
        userWorkspaceId,
        workspaceWorkflowVersionId,
      },
    );
  }

  @Query(() => [CoreWorkflowVersionDTO])
  async coreWorkflowVersionsByCoreWorkflowId(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args() { coreWorkflowId }: CoreWorkflowVersionsByCoreWorkflowIdArgs,
  ): Promise<CoreWorkflowVersionDTO[]> {
    return this.coreWorkflowVersionListService.findManyByCoreWorkflowId({
      workspaceId,
      userWorkspaceId,
      coreWorkflowId,
    });
  }

  @Query(() => CoreWorkflowVersionDTO, { nullable: true })
  async coreWorkflowVersionById(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args() { coreWorkflowVersionId }: CoreWorkflowVersionByIdArgs,
  ): Promise<CoreWorkflowVersionDTO | null> {
    return this.coreWorkflowVersionListService.findOneByCoreWorkflowVersionId({
      workspaceId,
      userWorkspaceId,
      coreWorkflowVersionId,
    });
  }
}
