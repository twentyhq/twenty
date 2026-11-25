import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { CoreWorkflowConnectionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-connection.dto';
import { CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
import { CoreWorkflowRunInsightsDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-run-insights.dto';
import { CoreWorkflowRunInsightsArgs } from 'src/engine/core-modules/workflow/dtos/core-workflow-run-insights.input';
import { CoreWorkflowWithCurrentVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-with-current-version.dto';
import { CoreWorkflowsWithCurrentVersionsInput } from 'src/engine/core-modules/workflow/dtos/core-workflows-with-current-versions.input';
import { CreateCoreWorkflowInput } from 'src/engine/core-modules/workflow/dtos/create-core-workflow.input';
import { DeletedCoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/deleted-core-workflow.dto';
import { DeleteCoreWorkflowsInput } from 'src/engine/core-modules/workflow/dtos/delete-core-workflows.input';
import { DiscardCoreWorkflowDraftInput } from 'src/engine/core-modules/workflow/dtos/discard-core-workflow-draft.input';
import { WorkflowQueryValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-query-validation-graphql-api-exception.filter';
import { CoreWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.dto';
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
import { CoreWorkflowRunInsightsService } from 'src/engine/core-modules/workflow/services/core-workflow-run-insights.service';
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
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { AuthContext } from 'src/engine/decorators/auth/auth-context.decorator';
import { AuthWorkspaceMember } from 'src/engine/decorators/auth/auth-workspace-member.decorator';
import { isDefined } from 'twenty-shared/utils';

import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/permissions/utils/permissions-graphql-api-exception.filter';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

const CORE_WORKFLOW_WRITE_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: true,
    application: false,
  },
  requiredPermissionFlags: [PermissionFlagType.WORKFLOWS],
};

const CORE_WORKFLOW_READ_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: true,
    application: true,
  },
  requiredPermissionFlags: [PermissionFlagType.WORKFLOWS],
};

@CoreResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(
  WorkflowQueryValidationGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  AuthGraphqlApiExceptionFilter,
)
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
export class CoreWorkflowResolver {
  constructor(
    private readonly coreWorkflowListService: CoreWorkflowListService,
    private readonly coreWorkflowMutationWorkspaceService: CoreWorkflowMutationWorkspaceService,
    private readonly coreWorkflowVersionListService: CoreWorkflowVersionListService,
    private readonly coreWorkflowRunInsightsService: CoreWorkflowRunInsightsService,
  ) {}

  private assertWorkflowActorOrThrow(principal: {
    workspaceMember?: WorkspaceMemberWorkspaceEntity;
    application?: FlatApplication;
  }): void {
    if (!isDefined(buildActorMetadataFromPrincipal(principal))) {
      throw new WorkflowQueryValidationException(
        'No authenticated actor to attribute the workflow to',
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Authentication is required to perform this action`,
        },
      );
    }
  }

  @Mutation(() => CoreWorkflowDTO, { nullable: true })
  @UseGuards(AccessPolicyGuard(CORE_WORKFLOW_WRITE_ACCESS_POLICY))
  async updateCoreWorkflow(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthContext() authContext: WorkspaceAuthContext,
    @Args('input')
    { coreWorkflowId, name, isPrivate }: UpdateCoreWorkflowInput,
  ): Promise<CoreWorkflowDTO | null> {
    await this.coreWorkflowMutationWorkspaceService.updateWorkflow({
      workspaceId,
      authContext,
      coreWorkflowId,
      name,
      isPrivate,
    });

    return this.coreWorkflowListService.findOneById({
      workspaceId,
      callerApplication: undefined,
      coreWorkflowId,
    });
  }

  @Mutation(() => CoreWorkflowDTO)
  @UseGuards(AccessPolicyGuard(CORE_WORKFLOW_WRITE_ACCESS_POLICY))
  async duplicateCoreWorkflow(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthWorkspaceMember() workspaceMember:
      | WorkspaceMemberWorkspaceEntity
      | undefined,
    @AuthApplication({ allowUndefined: true })
    application: FlatApplication | undefined,
    @AuthContext() authContext: WorkspaceAuthContext,
    @Args('input')
    {
      coreWorkflowIdToDuplicate,
      coreWorkflowVersionIdToCopy,
    }: DuplicateCoreWorkflowInput,
  ): Promise<CoreWorkflowDTO> {
    this.assertWorkflowActorOrThrow({ workspaceMember, application });

    return this.coreWorkflowMutationWorkspaceService.duplicateWorkflow({
      workspaceId,
      authContext,
      coreWorkflowIdToDuplicate,
      coreWorkflowVersionIdToCopy,
    });
  }

  @Mutation(() => CoreWorkflowDTO)
  @UseGuards(AccessPolicyGuard(CORE_WORKFLOW_WRITE_ACCESS_POLICY))
  async createCoreWorkflow(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthWorkspaceMember() workspaceMember:
      | WorkspaceMemberWorkspaceEntity
      | undefined,
    @AuthApplication({ allowUndefined: true })
    application: FlatApplication | undefined,
    @AuthContext() authContext: WorkspaceAuthContext,
    @Args('input') { name, isPrivate }: CreateCoreWorkflowInput,
  ): Promise<CoreWorkflowDTO> {
    this.assertWorkflowActorOrThrow({ workspaceMember, application });

    return this.coreWorkflowMutationWorkspaceService.createWorkflow({
      workspaceId,
      authContext,
      name,
      isPrivate,
    });
  }

  @Mutation(() => [DeletedCoreWorkflowDTO])
  @UseGuards(AccessPolicyGuard(CORE_WORKFLOW_WRITE_ACCESS_POLICY))
  async deleteCoreWorkflows(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input') input: DeleteCoreWorkflowsInput,
  ): Promise<DeletedCoreWorkflowDTO[]> {
    return this.coreWorkflowMutationWorkspaceService.deleteWorkflows({
      workspaceId,
      ...input,
    });
  }

  @Mutation(() => CoreWorkflowDTO, { nullable: true })
  @UseGuards(AccessPolicyGuard(CORE_WORKFLOW_WRITE_ACCESS_POLICY))
  async discardCoreWorkflowDraft(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input') input: DiscardCoreWorkflowDraftInput,
  ): Promise<CoreWorkflowDTO | null> {
    const coreWorkflowId =
      await this.coreWorkflowMutationWorkspaceService.discardDraftVersion({
        workspaceId,
        ...input,
      });

    if (!isDefined(coreWorkflowId)) {
      return null;
    }

    return this.coreWorkflowListService.findOneById({
      workspaceId,
      callerApplication: undefined,
      coreWorkflowId,
    });
  }

  @Query(() => CoreWorkflowConnectionDTO)
  @UseGuards(AccessPolicyGuard(CORE_WORKFLOW_READ_ACCESS_POLICY))
  async coreWorkflows(
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callerApplication: FlatApplication | undefined,
    @Args() coreWorkflowsArgs: CoreWorkflowsArgs,
  ): Promise<CoreWorkflowConnectionDTO> {
    return this.coreWorkflowListService.findManyByWorkspaceId({
      workspaceId,
      callerApplication,
      workspaceCustomApplicationId,
      ...coreWorkflowsArgs,
    });
  }

  @Query(() => CoreWorkflowDTO, { nullable: true })
  @UseGuards(AccessPolicyGuard(CORE_WORKFLOW_READ_ACCESS_POLICY))
  async coreWorkflowById(
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callerApplication: FlatApplication | undefined,
    @Args() { coreWorkflowId }: CoreWorkflowByIdArgs,
  ): Promise<CoreWorkflowDTO | null> {
    return this.coreWorkflowListService.findOneById({
      workspaceId,
      callerApplication,
      workspaceCustomApplicationId,
      coreWorkflowId,
    });
  }

  @Query(() => CoreWorkflowRunInsightsDTO, { nullable: true })
  @UseGuards(AccessPolicyGuard(CORE_WORKFLOW_READ_ACCESS_POLICY))
  async coreWorkflowRunInsights(
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callerApplication: FlatApplication | undefined,
    @Args() { coreWorkflowId, timeZone }: CoreWorkflowRunInsightsArgs,
  ): Promise<CoreWorkflowRunInsightsDTO | null> {
    const coreWorkflow = await this.coreWorkflowListService.findOneById({
      workspaceId,
      callerApplication,
      workspaceCustomApplicationId,
      coreWorkflowId,
    });

    if (!isDefined(coreWorkflow)) {
      return null;
    }

    return this.coreWorkflowRunInsightsService.findOneByCoreWorkflowId({
      coreWorkflowId: coreWorkflow.id,
      timeZone,
    });
  }

  @Query(() => [CoreWorkflowWithCurrentVersionDTO])
  @UseGuards(AccessPolicyGuard(CORE_WORKFLOW_READ_ACCESS_POLICY))
  async coreWorkflowsWithCurrentVersions(
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callerApplication: FlatApplication | undefined,
    @Args('input') { coreWorkflowIds }: CoreWorkflowsWithCurrentVersionsInput,
  ): Promise<CoreWorkflowWithCurrentVersionDTO[]> {
    return this.coreWorkflowListService.findManyWithCurrentVersions({
      workspaceId,
      callerApplication,
      workspaceCustomApplicationId,
      coreWorkflowIds,
    });
  }

  @Query(() => CoreWorkflowDTO, { nullable: true })
  @UseGuards(AccessPolicyGuard(CORE_WORKFLOW_READ_ACCESS_POLICY))
  async coreWorkflow(
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callerApplication: FlatApplication | undefined,
    @Args() { workspaceWorkflowId }: CoreWorkflowArgs,
  ): Promise<CoreWorkflowDTO | null> {
    return this.coreWorkflowListService.findOneByWorkspaceWorkflowId({
      workspaceId,
      callerApplication,
      workspaceCustomApplicationId,
      workspaceWorkflowId,
    });
  }

  @Query(() => [CoreWorkflowVersionDTO])
  @UseGuards(AccessPolicyGuard(CORE_WORKFLOW_READ_ACCESS_POLICY))
  async coreWorkflowVersions(
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callerApplication: FlatApplication | undefined,
    @Args() { workspaceWorkflowId }: CoreWorkflowVersionsArgs,
  ): Promise<CoreWorkflowVersionDTO[]> {
    return this.coreWorkflowVersionListService.findManyByWorkspaceWorkflowId({
      workspaceId,
      callerApplication,
      workspaceCustomApplicationId,
      workspaceWorkflowId,
    });
  }

  @Query(() => [CoreWorkflowVersionDTO])
  @UseGuards(AccessPolicyGuard(CORE_WORKFLOW_READ_ACCESS_POLICY))
  async coreWorkflowVersionsByCoreWorkflowId(
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callerApplication: FlatApplication | undefined,
    @Args() { coreWorkflowId }: CoreWorkflowVersionsByCoreWorkflowIdArgs,
  ): Promise<CoreWorkflowVersionDTO[]> {
    return this.coreWorkflowVersionListService.findManyByCoreWorkflowId({
      workspaceId,
      callerApplication,
      workspaceCustomApplicationId,
      coreWorkflowId,
    });
  }

  @Query(() => CoreWorkflowVersionDTO, { nullable: true })
  @UseGuards(AccessPolicyGuard(CORE_WORKFLOW_READ_ACCESS_POLICY))
  async coreWorkflowVersionById(
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callerApplication: FlatApplication | undefined,
    @Args() { coreWorkflowVersionId }: CoreWorkflowVersionByIdArgs,
  ): Promise<CoreWorkflowVersionDTO | null> {
    return this.coreWorkflowVersionListService.findOneByCoreWorkflowVersionId({
      workspaceId,
      callerApplication,
      workspaceCustomApplicationId,
      coreWorkflowVersionId,
    });
  }
}
