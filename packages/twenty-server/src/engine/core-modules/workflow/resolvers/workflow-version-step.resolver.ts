import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import graphqlTypeJson from 'graphql-type-json';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { TestHttpRequestInput } from 'src/engine/core-modules/workflow/dtos/test-http-request.input';
import { TestHttpRequestDTO } from 'src/engine/core-modules/workflow/dtos/test-http-request.dto';
import { TestWorkflowCodeStepInput } from 'src/engine/core-modules/workflow/dtos/test-workflow-code-step.input';
import { SubmitFormStepInput } from 'src/engine/core-modules/workflow/dtos/submit-form-step.input';
import { UpdateWorkflowRunStepInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-run-step.input';
import { WorkflowActionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-action.dto';
import { WorkflowVersionValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-validation-graphql-api-exception.filter';
import { WorkflowVersionStepGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-step-graphql-api-exception.filter';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { CoreWorkflowVersionListService } from 'src/engine/core-modules/workflow/services/core-workflow-version-list.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountHandleDTO } from 'src/engine/metadata-modules/connected-account/dtos/connected-account-handle.dto';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { LogicFunctionExecutionResultDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { fromLogicFunctionExecuteResultToDTO } from 'src/engine/metadata-modules/logic-function/utils/from-logic-function-execute-result-to-dto.util';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/permissions/utils/permissions-graphql-api-exception.filter';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { CodeStepRunnerService } from 'src/modules/workflow/workflow-executor/workflow-actions/code/services/code-step-runner.service';
import { canUpdateWorkflowRunStep } from 'src/modules/workflow/workflow-runner/utils/can-update-workflow-run-step.util';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

const WORKFLOW_VERSION_STEP_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: { withUser: true, withoutUser: false },
    application: { withUser: true, withoutUser: false },
  },
  requiredPermissionFlags: [PermissionFlagType.WORKFLOWS],
};

// Inline code runs with the workspace custom application's token, which no app or OAuth caller may borrow
const WORKFLOW_CODE_STEP_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  },
  requiredPermissionFlags: [PermissionFlagType.WORKFLOWS],
};

@CoreResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  WorkflowVersionStepGraphqlApiExceptionFilter,
  WorkflowVersionValidationGraphqlApiExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
export class WorkflowVersionStepResolver {
  constructor(
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    private readonly httpTool: HttpTool,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    private readonly coreWorkflowVersionListService: CoreWorkflowVersionListService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly codeStepRunnerService: CodeStepRunnerService,
  ) {}

  // Related to https://github.com/twentyhq/private-issues/issues/478
  @Query(() => ConnectedAccountHandleDTO, { nullable: true })
  @UseGuards(AccessPolicyGuard(WORKFLOW_VERSION_STEP_ACCESS_POLICY))
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

  @Mutation(() => WorkflowActionDTO)
  @UseGuards(
    AccessPolicyGuard({
      authPrincipals: {
        userSession: {
          standard: true,
          impersonated: true,
          playground: true,
          workspaceAgnostic: false,
        },
        apiKey: false,
        oauthClient: { withUser: true, withoutUser: false },
        application: false,
      },
      requiredPermissionFlags: [PermissionFlagType.WORKFLOWS],
    }),
  )
  async updateWorkflowRunStep(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input')
    { workflowRunId, step }: UpdateWorkflowRunStepInput,
  ): Promise<WorkflowActionDTO> {
    await this.assertWorkflowRunIsReadableByRequesterOrThrow(workflowRunId);

    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    if (!canUpdateWorkflowRunStep({ workflowRun, step })) {
      throw new WorkflowVersionStepException(
        'Only the values of a form step can change on a workflow run',
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

  @Mutation(() => Boolean)
  @UseGuards(AccessPolicyGuard(WORKFLOW_VERSION_STEP_ACCESS_POLICY))
  async submitFormStep(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('input') { workflowRunId, stepId, response }: SubmitFormStepInput,
  ): Promise<boolean> {
    if (!isPlainObject(response)) {
      throw new WorkflowVersionStepException(
        'A form response must be an object',
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
      );
    }

    await this.assertWorkflowRunIsReadableByRequesterOrThrow(workflowRunId);

    await this.workflowRunnerWorkspaceService.submitFormStep({
      workspaceId,
      workflowRunId,
      stepId,
      response,
    });

    return true;
  }

  @Mutation(() => TestHttpRequestDTO)
  @UseGuards(AccessPolicyGuard(WORKFLOW_VERSION_STEP_ACCESS_POLICY))
  async testHttpRequest(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() { id: userId }: AuthContextUser,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
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
      {
        workspaceId: workspace.id,
        userId,
        userWorkspaceId,
        workspaceMemberId,
        outboundRequestSource: 'workflow-http-test',
      },
    );
  }

  @Query(() => graphqlTypeJson)
  @UseGuards(AccessPolicyGuard(WORKFLOW_CODE_STEP_ACCESS_POLICY))
  async workflowCodeStepAvailablePackages(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('workflowVersionId', { type: () => UUIDScalarType })
    workflowVersionId: string,
  ): Promise<Record<string, string>> {
    const { flatApplication } = await this.findWorkflowApplicationOrThrow({
      workspace,
      userWorkspaceId,
      workflowVersionId,
    });

    return flatApplication.availablePackages ?? {};
  }

  @Mutation(() => LogicFunctionExecutionResultDTO)
  @UseGuards(AccessPolicyGuard(WORKFLOW_CODE_STEP_ACCESS_POLICY))
  async testWorkflowCodeStep(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() { id: userId }: AuthContextUser,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('input')
    { workflowVersionId, code, payload }: TestWorkflowCodeStepInput,
  ): Promise<LogicFunctionExecutionResultDTO> {
    const { flatApplication, workflowId } =
      await this.findWorkflowApplicationOrThrow({
        workspace,
        userWorkspaceId,
        workflowVersionId,
      });

    const result = await this.codeStepRunnerService.run({
      flatApplication,
      code,
      payload,
      userId,
      userWorkspaceId,
      workflowId,
    });

    return fromLogicFunctionExecuteResultToDTO(result);
  }

  private async findWorkflowApplicationOrThrow({
    workspace: { id: workspaceId, workspaceCustomApplicationId },
    userWorkspaceId,
    workflowVersionId,
  }: {
    workspace: Pick<WorkspaceEntity, 'id' | 'workspaceCustomApplicationId'>;
    userWorkspaceId: string;
    workflowVersionId: string;
  }): Promise<{ flatApplication: FlatApplication; workflowId: string }> {
    const coreWorkflowVersion =
      await this.coreWorkflowVersionListService.findOneByCoreWorkflowVersionId({
        workspaceId,
        userWorkspaceId,
        callerApplication: undefined,
        coreWorkflowVersionId: workflowVersionId,
      });

    if (!isDefined(coreWorkflowVersion?.coreWorkflowId)) {
      throw new WorkflowVersionStepException(
        'Workflow version not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    const { flatWorkflowMaps, flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkflowMaps',
        'flatApplicationMaps',
      ]);

    const flatWorkflow = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: coreWorkflowVersion.coreWorkflowId,
      flatEntityMaps: flatWorkflowMaps,
    });

    // inline code runs with its application's token and variables, so only builder workflows may test it
    const flatApplication =
      flatWorkflow?.applicationId === workspaceCustomApplicationId
        ? flatApplicationMaps.byId[workspaceCustomApplicationId]
        : undefined;

    if (!isDefined(flatApplication)) {
      throw new WorkflowVersionStepException(
        'Application of the workflow not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    return {
      flatApplication,
      workflowId:
        coreWorkflowVersion.workspaceWorkflowId ??
        coreWorkflowVersion.coreWorkflowId,
    };
  }

  private async assertWorkflowRunIsReadableByRequesterOrThrow(
    workflowRunId: string,
  ): Promise<void> {
    if (
      !(await this.workflowRunWorkspaceService.isWorkflowRunReadableByRequester(
        workflowRunId,
      ))
    ) {
      throw new WorkflowVersionStepException(
        'Workflow run not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }
  }
}
