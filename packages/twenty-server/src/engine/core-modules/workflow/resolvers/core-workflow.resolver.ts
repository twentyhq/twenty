import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { type ActorMetadata } from 'twenty-shared/types';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { CoreWorkflowConnectionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-connection.dto';
import { CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
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
import { CoreWorkflowsArgs } from 'src/engine/core-modules/workflow/dtos/core-workflows.input';
import { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import { CoreWorkflowMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-mutation.workspace-service';
import { CoreWorkflowVersionListService } from 'src/engine/core-modules/workflow/services/core-workflow-version-list.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { buildActorMetadataFromPrincipal } from 'src/engine/core-modules/actor/utils/build-actor-metadata-from-principal.util';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspaceMember } from 'src/engine/decorators/auth/auth-workspace-member.decorator';
import { isDefined } from 'twenty-shared/utils';

import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserOrApplicationAuthGuard } from 'src/engine/guards/user-or-application-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@CoreResolver()
@UsePipes(ResolverValidationPipe)
@UseGuards(
  WorkspaceAuthGuard,
  UserOrApplicationAuthGuard,
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

  private resolveCreatedByOrThrow(principal: {
    workspaceMember?: WorkspaceMemberWorkspaceEntity;
    application?: FlatApplication;
  }): ActorMetadata {
    const createdBy = buildActorMetadataFromPrincipal(principal);

    if (!isDefined(createdBy)) {
      throw new WorkflowQueryValidationException(
        'No authenticated actor to attribute the workflow to',
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Authentication is required to perform this action`,
        },
      );
    }

    return createdBy;
  }

  @Mutation(() => CoreWorkflowDTO, { nullable: true })
  async updateCoreWorkflow(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input') input: UpdateCoreWorkflowInput,
  ): Promise<CoreWorkflowDTO | null> {
    await this.coreWorkflowMutationWorkspaceService.updateWorkflow(
      workspaceId,
      input,
    );

    return this.coreWorkflowListService.findOneById({
      workspaceId,
      coreWorkflowId: input.coreWorkflowId,
    });
  }

  @Mutation(() => CoreWorkflowDTO)
  async duplicateCoreWorkflow(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthWorkspaceMember() workspaceMember:
      | WorkspaceMemberWorkspaceEntity
      | undefined,
    @AuthApplication({ allowUndefined: true })
    application: FlatApplication | undefined,
    @Args('input')
    {
      coreWorkflowIdToDuplicate,
      coreWorkflowVersionIdToCopy,
    }: DuplicateCoreWorkflowInput,
  ): Promise<CoreWorkflowDTO> {
    return this.coreWorkflowMutationWorkspaceService.duplicateWorkflow({
      workspaceId,
      createdBy: this.resolveCreatedByOrThrow({ workspaceMember, application }),
      coreWorkflowIdToDuplicate,
      coreWorkflowVersionIdToCopy,
    });
  }

  @Mutation(() => CoreWorkflowDTO)
  async createCoreWorkflow(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthWorkspaceMember() workspaceMember:
      | WorkspaceMemberWorkspaceEntity
      | undefined,
    @AuthApplication({ allowUndefined: true })
    application: FlatApplication | undefined,
    @Args('input') input: CreateCoreWorkflowInput,
  ): Promise<CoreWorkflowDTO> {
    return this.coreWorkflowMutationWorkspaceService.createWorkflow({
      workspaceId,
      createdBy: this.resolveCreatedByOrThrow({ workspaceMember, application }),
      name: input.name,
    });
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

  @Mutation(() => CoreWorkflowDTO, { nullable: true })
  async discardCoreWorkflowDraft(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input') input: DiscardCoreWorkflowDraftInput,
  ): Promise<CoreWorkflowDTO | null> {
    const coreWorkflowId =
      await this.coreWorkflowMutationWorkspaceService.discardDraftVersion(
        workspaceId,
        input,
      );

    if (!isDefined(coreWorkflowId)) {
      return null;
    }

    return this.coreWorkflowListService.findOneById({
      workspaceId,
      coreWorkflowId,
    });
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
  async coreWorkflowById(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args() { coreWorkflowId }: CoreWorkflowByIdArgs,
  ): Promise<CoreWorkflowDTO | null> {
    return this.coreWorkflowListService.findOneById({
      workspaceId,
      coreWorkflowId,
    });
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

  @Query(() => [CoreWorkflowVersionDTO])
  async coreWorkflowVersionsByCoreWorkflowId(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args() { coreWorkflowId }: CoreWorkflowVersionsByCoreWorkflowIdArgs,
  ): Promise<CoreWorkflowVersionDTO[]> {
    return this.coreWorkflowVersionListService.findManyByCoreWorkflowId({
      workspaceId,
      coreWorkflowId,
    });
  }

  @Query(() => CoreWorkflowVersionDTO, { nullable: true })
  async coreWorkflowVersionById(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args() { coreWorkflowVersionId }: CoreWorkflowVersionByIdArgs,
  ): Promise<CoreWorkflowVersionDTO | null> {
    return this.coreWorkflowVersionListService.findOneByCoreWorkflowVersionId({
      workspaceId,
      coreWorkflowVersionId,
    });
  }
}
