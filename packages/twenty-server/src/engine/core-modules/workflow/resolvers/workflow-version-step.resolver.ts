import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { CreateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-step-input.dto';
import { DeleteWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/delete-workflow-version-step-input.dto';
import { DuplicateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/duplicate-workflow-version-step-input.dto';
import { SubmitFormStepInput } from 'src/engine/core-modules/workflow/dtos/submit-form-step-input.dto';
import { TestHttpRequestInput } from 'src/engine/core-modules/workflow/dtos/test-http-request-input.dto';
import { TestHttpRequestOutput } from 'src/engine/core-modules/workflow/dtos/test-http-request-output.dto';
import { UpdateWorkflowRunStepInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-run-step-input.dto';
import { UpdateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-version-step-input.dto';
import { WorkflowActionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-action.dto';
import { WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
import { WorkflowVersionStepGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-step-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';

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
  WorkflowVersionStepGraphqlApiExceptionFilter,
)
export class WorkflowVersionStepResolver {
  constructor(
    private readonly workflowVersionStepWorkspaceService: WorkflowVersionStepWorkspaceService,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly httpTool: HttpTool,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Mutation(() => WorkflowVersionStepChangesDTO)
  async createWorkflowVersionStep(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input')
    input: CreateWorkflowVersionStepInput,
  ): Promise<WorkflowVersionStepChangesDTO> {
    if (input.stepType === WorkflowActionType.AI_AGENT) {
      const isAiEnabled = await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_AI_ENABLED,
        workspaceId,
      );

      if (!isAiEnabled) {
        throw new Error(
          'AI features are not available in your current workspace. Please contact support to enable them.',
        );
      }
    }

    return this.workflowVersionStepWorkspaceService.createWorkflowVersionStep({
      workspaceId,
      input,
    });
  }

  @Mutation(() => WorkflowActionDTO)
  async updateWorkflowVersionStep(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input')
    { step, workflowVersionId }: UpdateWorkflowVersionStepInput,
  ): Promise<WorkflowActionDTO> {
    return this.workflowVersionStepWorkspaceService.updateWorkflowVersionStep({
      workspaceId,
      workflowVersionId,
      step,
    });
  }

  @Mutation(() => WorkflowVersionStepChangesDTO)
  async deleteWorkflowVersionStep(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input')
    { stepId, workflowVersionId }: DeleteWorkflowVersionStepInput,
  ): Promise<WorkflowVersionStepChangesDTO> {
    return this.workflowVersionStepWorkspaceService.deleteWorkflowVersionStep({
      workspaceId,
      workflowVersionId,
      stepIdToDelete: stepId,
    });
  }

  @Mutation(() => Boolean)
  async submitFormStep(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input')
    { stepId, workflowRunId, response }: SubmitFormStepInput,
  ) {
    await this.workflowRunnerWorkspaceService.submitFormStep({
      workspaceId,
      stepId,
      workflowRunId,
      response,
    });

    return true;
  }

  @Mutation(() => WorkflowActionDTO)
  async updateWorkflowRunStep(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input')
    { workflowRunId, step }: UpdateWorkflowRunStepInput,
  ): Promise<WorkflowActionDTO> {
    await this.workflowRunWorkspaceService.updateWorkflowRunStep({
      workspaceId,
      workflowRunId,
      step,
    });

    return step;
  }

  @Mutation(() => WorkflowVersionStepChangesDTO)
  async duplicateWorkflowVersionStep(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input')
    { stepId, workflowVersionId }: DuplicateWorkflowVersionStepInput,
  ): Promise<WorkflowVersionStepChangesDTO> {
    return this.workflowVersionStepWorkspaceService.duplicateWorkflowVersionStep(
      {
        workspaceId,
        workflowVersionId,
        stepId,
      },
    );
  }

  @Mutation(() => TestHttpRequestOutput)
  async testHttpRequest(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input')
    { url, method, headers, body }: TestHttpRequestInput,
  ): Promise<TestHttpRequestOutput> {
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
