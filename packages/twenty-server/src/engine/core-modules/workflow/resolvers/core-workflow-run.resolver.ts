import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { AuthenticationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { RunCoreWorkflowVersionInput } from 'src/engine/core-modules/workflow/dtos/run-core-workflow-version.input';
import { RunWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/run-workflow-version.dto';
import { WorkflowQueryValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-query-validation-graphql-api-exception.filter';
import { WorkflowRunGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-run-graphql-api-exception.filter';
import { WorkflowTriggerGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-graphql-api-exception.filter';
import { WorkflowVersionEdgeGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-edge-graphql-api-exception.filter';
import { WorkflowVersionStepGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-step-graphql-api-exception.filter';
import { WorkflowVersionValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-validation-graphql-api-exception.filter';
import { CoreWorkflowVersionRunService } from 'src/engine/core-modules/workflow/services/core-workflow-version-run.service';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/permissions/utils/permissions-graphql-api-exception.filter';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@CoreResolver()
@UsePipes(ResolverValidationPipe)
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
      application: { withUser: true, withoutUser: false },
    },
    requiredPermissionFlags: [PermissionFlagType.WORKFLOWS],
  }),
)
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  WorkflowQueryValidationGraphqlApiExceptionFilter,
  WorkflowRunGraphqlApiExceptionFilter,
  WorkflowTriggerGraphqlApiExceptionFilter,
  WorkflowVersionEdgeGraphqlApiExceptionFilter,
  WorkflowVersionStepGraphqlApiExceptionFilter,
  WorkflowVersionValidationGraphqlApiExceptionFilter,
)
export class CoreWorkflowRunResolver {
  constructor(
    private readonly coreWorkflowVersionRunService: CoreWorkflowVersionRunService,
  ) {}

  @Mutation(() => RunWorkflowVersionDTO)
  async runCoreWorkflowVersion(
    @Args('input')
    {
      coreWorkflowVersionId,
      workflowRunId,
      payload,
    }: RunCoreWorkflowVersionInput,
  ): Promise<RunWorkflowVersionDTO> {
    const authContext = getWorkspaceAuthContext();

    if (!isUserAuthContext(authContext)) {
      throw new AuthenticationError('User authentication required');
    }

    return this.coreWorkflowVersionRunService.run({
      authContext,
      coreWorkflowVersionId,
      workflowRunId: workflowRunId ?? undefined,
      payload,
    });
  }
}
