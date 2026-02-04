import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/services/logic-function-executor.service';
import { ExecuteCodeStepInput } from 'src/engine/core-modules/workflow/dtos/execute-code-step-input.dto';
import { GetCodeStepSourceCodeInput } from 'src/engine/core-modules/workflow/dtos/get-code-step-source-code-input.dto';
import { UpdateCodeStepSourceInput } from 'src/engine/core-modules/workflow/dtos/update-code-step-source-input.dto';
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
      id: input.logicFunctionId,
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
      input.logicFunctionId,
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
      id: input.logicFunctionId,
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
    const { logicFunctionId, payload } = input;

    const { flatLogicFunctionMaps, flatApplicationMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps', 'flatApplicationMaps'],
        },
      );

    const flatLogicFunction = findFlatLogicFunctionOrThrow({
      id: logicFunctionId,
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

    const { checksum } = await this.codeStepBuildService.buildFromSourceToBuilt(
      {
        flatLogicFunction,
        applicationUniversalIdentifier,
      },
    );

    await this.logicFunctionService.updateChecksum({
      id: logicFunctionId,
      checksum,
      workspaceId,
    });

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
