import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { CreateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-step.input';
import { DeleteWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/delete-workflow-version-step.input';
import { DuplicateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/duplicate-workflow-version-step.input';
import { TestHttpRequestInput } from 'src/engine/core-modules/workflow/dtos/test-http-request.input';
import { TestHttpRequestDTO } from 'src/engine/core-modules/workflow/dtos/test-http-request.dto';
import { UpdateWorkflowRunStepInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-run-step.input';
import { UpdateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-version-step.input';
import { UpdateWorkflowVersionTriggerInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-version-trigger.input';
import { WorkflowActionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-action.dto';
import { WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
import { WorkflowVersionTriggerDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-trigger.dto';
import { WorkflowVersionValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-validation-graphql-api-exception.filter';
import { WorkflowVersionStepGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-step-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountHandleDTO } from 'src/engine/metadata-modules/connected-account/dtos/connected-account-handle.dto';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';
import { canUpdateWorkflowRunStep } from 'src/modules/workflow/workflow-runner/utils/can-update-workflow-run-step.util';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';

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
    oauthClient: { withUser: true, withoutUser: false },
    application: { withUser: true, withoutUser: false },
  }),
  SettingsPermissionGuard(PermissionFlagType.WORKFLOWS),
)
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  WorkflowVersionStepGraphqlApiExceptionFilter,
  WorkflowVersionValidationGraphqlApiExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
export class WorkflowVersionStepResolver {
  constructor(
    private readonly workflowVersionStepWorkspaceService: WorkflowVersionStepWorkspaceService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly httpTool: HttpTool,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    private readonly coreWorkflowAccessService: CoreWorkflowAccessService,
  ) {}

  // Related to https://github.com/twentyhq/private-issues/issues/478
  @Query(() => ConnectedAccountHandleDTO, { nullable: true })
  async workflowStepConnectedAccountHandle(
    @Args('connectedAccountId', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ConnectedAccountHandleDTO | null> {
    const account = await this.connectedAccountMetadataService.findById({
      id,
      workspaceId,
    });

    if (!account) {
      return null;
    }

    return {
      id: account.id,
      handle: account.handle,
      provider: account.provider,
      handleAliases: account.handleAliases,
    };
  }

  @Mutation(() => WorkflowVersionStepChangesDTO)
  async createWorkflowVersionStep(
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input')
    input: CreateWorkflowVersionStepInput,
  ): Promise<WorkflowVersionStepChangesDTO> {
    await this.coreWorkflowAccessService.assertWorkspaceWorkflowVersionsAreAccessibleOrThrow(
      {
        workspaceId,
        userWorkspaceId,
        workspaceWorkflowVersionIds: [input.workflowVersionId],
      },
    );

    return this.workflowVersionStepWorkspaceService.createWorkflowVersionStep({
      workspaceId,
      input,
    });
  }

  @Mutation(() => WorkflowActionDTO)
  async updateWorkflowVersionStep(
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input')
    { step, workflowVersionId }: UpdateWorkflowVersionStepInput,
  ): Promise<WorkflowActionDTO> {
    await this.coreWorkflowAccessService.assertWorkspaceWorkflowVersionsAreAccessibleOrThrow(
      {
        workspaceId,
        userWorkspaceId,
        workspaceWorkflowVersionIds: [workflowVersionId],
      },
    );

    return this.workflowVersionStepWorkspaceService.updateWorkflowVersionStep({
      workspaceId,
      workflowVersionId,
      step,
    });
  }

  @Mutation(() => WorkflowVersionTriggerDTO)
  async updateWorkflowVersionTrigger(
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input')
    { trigger, workflowVersionId }: UpdateWorkflowVersionTriggerInput,
  ): Promise<WorkflowVersionTriggerDTO> {
    await this.coreWorkflowAccessService.assertWorkspaceWorkflowVersionsAreAccessibleOrThrow(
      {
        workspaceId,
        userWorkspaceId,
        workspaceWorkflowVersionIds: [workflowVersionId],
      },
    );

    return this.workflowVersionStepWorkspaceService.updateWorkflowVersionTrigger(
      {
        workspaceId,
        workflowVersionId,
        trigger,
      },
    );
  }

  @Mutation(() => WorkflowVersionStepChangesDTO)
  async deleteWorkflowVersionStep(
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input')
    { stepId, workflowVersionId }: DeleteWorkflowVersionStepInput,
  ): Promise<WorkflowVersionStepChangesDTO> {
    await this.coreWorkflowAccessService.assertWorkspaceWorkflowVersionsAreAccessibleOrThrow(
      {
        workspaceId,
        userWorkspaceId,
        workspaceWorkflowVersionIds: [workflowVersionId],
      },
    );

    return this.workflowVersionStepWorkspaceService.deleteWorkflowVersionStep({
      workspaceId,
      workflowVersionId,
      stepIdToDelete: stepId,
    });
  }

  @Mutation(() => WorkflowActionDTO)
  async updateWorkflowRunStep(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input')
    { workflowRunId, step }: UpdateWorkflowRunStepInput,
  ): Promise<WorkflowActionDTO> {
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    if (!canUpdateWorkflowRunStep({ workflowRun, step })) {
      throw new WorkflowVersionStepException(
        'Only the values of a form step can change on a workflow run bound to an application',
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
        {
          userFriendlyMessage: msg`Only the values of this form can be changed.`,
        },
      );
    }

    await this.workflowRunWorkspaceService.updateWorkflowRunStep({
      workspaceId,
      workflowRunId,
      step,
    });

    return step;
  }

  @Mutation(() => WorkflowVersionStepChangesDTO)
  async duplicateWorkflowVersionStep(
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input')
    { stepId, workflowVersionId }: DuplicateWorkflowVersionStepInput,
  ): Promise<WorkflowVersionStepChangesDTO> {
    await this.coreWorkflowAccessService.assertWorkspaceWorkflowVersionsAreAccessibleOrThrow(
      {
        workspaceId,
        userWorkspaceId,
        workspaceWorkflowVersionIds: [workflowVersionId],
      },
    );

    return this.workflowVersionStepWorkspaceService.duplicateWorkflowVersionStep(
      {
        workspaceId,
        workflowVersionId,
        stepId,
      },
    );
  }

  @Mutation(() => TestHttpRequestDTO)
  async testHttpRequest(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input')
    { url, method, headers, body }: TestHttpRequestInput,
  ): Promise<TestHttpRequestDTO> {
    return this.httpTool.execute(
      {
        url,
        method,
        headers,
        body,
      },
      { workspaceId: workspace.id },
    );
  }
}
