import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';
import { PermissionFlagType } from 'twenty-shared/constants';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/services/logic-function-executor.service';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { CreateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-step-input.dto';
import { DeleteWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/delete-workflow-version-step-input.dto';
import { DuplicateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/duplicate-workflow-version-step-input.dto';
import { ExecuteCodeStepInput } from 'src/engine/core-modules/workflow/dtos/execute-code-step-input.dto';
import { GetCodeStepSourceCodeInput } from 'src/engine/core-modules/workflow/dtos/get-code-step-source-code-input.dto';
import { SubmitFormStepInput } from 'src/engine/core-modules/workflow/dtos/submit-form-step-input.dto';
import { TestHttpRequestInput } from 'src/engine/core-modules/workflow/dtos/test-http-request-input.dto';
import { TestHttpRequestOutput } from 'src/engine/core-modules/workflow/dtos/test-http-request-output.dto';
import { UpdateCodeStepSourceInput } from 'src/engine/core-modules/workflow/dtos/update-code-step-source-input.dto';
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
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { LogicFunctionExecutionResultDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionService } from 'src/engine/metadata-modules/logic-function/services/logic-function.service';
import { findFlatLogicFunctionOrThrow } from 'src/engine/metadata-modules/logic-function/utils/find-flat-logic-function-or-throw.util';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { CodeStepBuildService } from 'src/modules/workflow/code-step-build/services/code-step-build.service';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';
import { isDefined } from 'twenty-shared/utils';

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
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly codeStepBuildService: CodeStepBuildService,
    private readonly logicFunctionService: LogicFunctionService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  @Query(() => graphqlTypeJson, { nullable: true })
  async getCodeStepSourceCode(
    @Args('input') input: GetCodeStepSourceCodeInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const flatLogicFunction = findFlatLogicFunctionOrThrow({
      id: input.id,
      flatLogicFunctionMaps,
    });

    if (
      !this.codeStepBuildService.isWorkflowCodeStepLogicFunction(
        flatLogicFunction,
      )
    ) {
      return null;
    }

    return await this.logicFunctionExecutorService.getLogicFunctionSourceCode(
      workspaceId,
      input.id,
    );
  }

  @Mutation(() => Boolean)
  async updateCodeStepSource(
    @Args('input') input: UpdateCodeStepSourceInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    const { flatLogicFunctionMaps, flatApplicationMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps', 'flatApplicationMaps'],
        },
      );

    const flatLogicFunction = findFlatLogicFunctionOrThrow({
      id: input.id,
      flatLogicFunctionMaps,
    });

    if (
      !this.codeStepBuildService.isWorkflowCodeStepLogicFunction(
        flatLogicFunction,
      )
    ) {
      return false;
    }

    const applicationUniversalIdentifier = isDefined(
      flatLogicFunction.applicationId,
    )
      ? flatApplicationMaps.byId[flatLogicFunction.applicationId]
          ?.universalIdentifier
      : undefined;

    if (!isDefined(applicationUniversalIdentifier)) {
      return false;
    }

    await this.codeStepBuildService.updateCodeStepSource({
      flatLogicFunction,
      code: input.code,
      applicationUniversalIdentifier,
    });

    return true;
  }

  @Mutation(() => LogicFunctionExecutionResultDTO)
  async executeCodeStep(
    @Args('input') input: ExecuteCodeStepInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<LogicFunctionExecutionResultDTO> {
    const { id, payload } = input;

    const { flatLogicFunctionMaps, flatApplicationMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps', 'flatApplicationMaps'],
        },
      );

    const flatLogicFunction = findFlatLogicFunctionOrThrow({
      id,
      flatLogicFunctionMaps,
    });

    if (
      !this.codeStepBuildService.isWorkflowCodeStepLogicFunction(
        flatLogicFunction,
      )
    ) {
      throw new Error(
        'Logic function is not a workflow code step or does not exist',
      );
    }

    const applicationUniversalIdentifier = isDefined(
      flatLogicFunction.applicationId,
    )
      ? flatApplicationMaps.byId[flatLogicFunction.applicationId]
          ?.universalIdentifier
      : undefined;

    if (!isDefined(applicationUniversalIdentifier)) {
      throw new Error(
        'Workflow code step application universal identifier not found',
      );
    }

    const { checksum } =
      await this.codeStepBuildService.buildFromSourceToBuilt({
        flatLogicFunction,
        applicationUniversalIdentifier,
      });

    await this.logicFunctionService.updateChecksum({
      id,
      checksum,
      workspaceId,
    });

    const result =
      await this.logicFunctionExecutorService.executeOneLogicFunction({
        id,
        workspaceId,
        payload,
      });

    return {
      data: result.data as LogicFunctionExecutionResultDTO['data'],
      logs: result.logs,
      duration: result.duration,
      status: result.status,
      error: result.error
        ? {
            errorType: result.error.errorType,
            errorMessage: result.error.errorMessage,
            stackTrace: Array.isArray(result.error.stackTrace)
              ? result.error.stackTrace.join('\n')
              : result.error.stackTrace,
          }
        : undefined,
    };
  }

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
