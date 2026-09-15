import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { CoreWorkflowConnectionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-connection.dto';
import { CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
import { CreateCoreWorkflowInput } from 'src/engine/core-modules/workflow/dtos/create-core-workflow.input';
import { DeletedCoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/deleted-core-workflow.dto';
import { DeleteCoreWorkflowsInput } from 'src/engine/core-modules/workflow/dtos/delete-core-workflows.input';
import { CoreWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.dto';
import { CoreWorkflowVersionArgs } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.input';
import { CoreWorkflowVersionsArgs } from 'src/engine/core-modules/workflow/dtos/core-workflow-versions.input';
import { CoreWorkflowArgs } from 'src/engine/core-modules/workflow/dtos/core-workflow.input';
import { CoreWorkflowsArgs } from 'src/engine/core-modules/workflow/dtos/core-workflows.input';
import { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import { CoreWorkflowMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-mutation.workspace-service';
import { CoreWorkflowVersionListService } from 'src/engine/core-modules/workflow/services/core-workflow-version-list.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
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
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class CoreWorkflowResolver {
  constructor(
    private readonly coreWorkflowListService: CoreWorkflowListService,
    private readonly coreWorkflowMutationWorkspaceService: CoreWorkflowMutationWorkspaceService,
    private readonly coreWorkflowVersionListService: CoreWorkflowVersionListService,
  ) {}

  @Mutation(() => CoreWorkflowDTO)
  async createCoreWorkflow(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUser() user: AuthContextUser,
    @Args('input') input: CreateCoreWorkflowInput,
  ): Promise<CoreWorkflowDTO> {
    return this.coreWorkflowMutationWorkspaceService.createWorkflow(
      workspaceId,
      user,
      input,
    );
  }

  @Mutation(() => [DeletedCoreWorkflowDTO])
  async deleteCoreWorkflows(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input') input: DeleteCoreWorkflowsInput,
  ): Promise<DeletedCoreWorkflowDTO[]> {
    return this.coreWorkflowMutationWorkspaceService.deleteWorkflows(
      workspaceId,
      input,
    );
  }

  @Query(() => CoreWorkflowConnectionDTO)
  async coreWorkflows(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args() coreWorkflowsArgs: CoreWorkflowsArgs,
  ): Promise<CoreWorkflowConnectionDTO> {
    return this.coreWorkflowListService.findManyByWorkspaceId(
      workspaceId,
      coreWorkflowsArgs,
    );
  }

  @Query(() => CoreWorkflowDTO, { nullable: true })
  async coreWorkflow(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args() { workspaceWorkflowId }: CoreWorkflowArgs,
  ): Promise<CoreWorkflowDTO | null> {
    return this.coreWorkflowListService.findOneByWorkspaceWorkflowId({
      workspaceId,
      workspaceWorkflowId,
    });
  }

  @Query(() => [CoreWorkflowVersionDTO])
  async coreWorkflowVersions(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args() { workspaceWorkflowId }: CoreWorkflowVersionsArgs,
  ): Promise<CoreWorkflowVersionDTO[]> {
    return this.coreWorkflowVersionListService.findManyByWorkspaceWorkflowId({
      workspaceId,
      workspaceWorkflowId,
    });
  }

  @Query(() => CoreWorkflowVersionDTO, { nullable: true })
  async coreWorkflowVersion(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args() { workspaceWorkflowVersionId }: CoreWorkflowVersionArgs,
  ): Promise<CoreWorkflowVersionDTO | null> {
    return this.coreWorkflowVersionListService.findOneByWorkspaceWorkflowVersionId(
      {
        workspaceId,
        workspaceWorkflowVersionId,
      },
    );
  }
}
