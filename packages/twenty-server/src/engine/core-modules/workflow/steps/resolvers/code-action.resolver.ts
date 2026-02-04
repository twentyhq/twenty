import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';
import { PermissionFlagType } from 'twenty-shared/constants';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/services/logic-function-executor.service';
import { WorkflowVersionStepGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-step-graphql-api-exception.filter';
import { ExecuteCodeStepInput } from 'src/engine/core-modules/workflow/steps/dtos/execute-code-step-input.dto';
import { GetCodeStepSourceCodeInput } from 'src/engine/core-modules/workflow/steps/dtos/get-code-step-source-code-input.dto';
import { UpdateCodeStepSourceInput } from 'src/engine/core-modules/workflow/steps/dtos/update-code-step-source-input.dto';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { LogicFunctionExecutionResultDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { CodeStepBuildService } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/services/code-step-build.service';

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
export class CodeActionResolver {
  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly codeStepBuildService: CodeStepBuildService,
  ) {}

  @Query(() => graphqlTypeJson, { nullable: true })
  async getCodeStepSourceCode(
    @Args('input') input: GetCodeStepSourceCodeInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.codeStepBuildService.getCodeStepSourceCode(
      workspaceId,
      input.logicFunctionId,
    );
  }

  @Mutation(() => Boolean)
  async updateCodeStepSource(
    @Args('input') input: UpdateCodeStepSourceInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    return this.codeStepBuildService.updateCodeStepSourceByLogicFunctionId({
      logicFunctionId: input.logicFunctionId,
      workspaceId,
      code: input.code,
    });
  }

  @Mutation(() => LogicFunctionExecutionResultDTO)
  async executeCodeStep(
    @Args('input') input: ExecuteCodeStepInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<LogicFunctionExecutionResultDTO> {
    const { logicFunctionId, payload } = input;

    await this.codeStepBuildService.buildFromSourceAndUpdateChecksumForCodeStep(
      {
        logicFunctionId,
        workspaceId,
      },
    );

    const result =
      await this.logicFunctionExecutorService.executeOneLogicFunction({
        id: logicFunctionId,
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
}
