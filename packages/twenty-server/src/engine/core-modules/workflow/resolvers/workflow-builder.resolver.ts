import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';
import { PermissionFlagType } from 'twenty-shared/constants';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { isDefined } from 'twenty-shared/utils';

import { ComputeStepOutputSchemaInput } from 'src/engine/core-modules/workflow/dtos/compute-step-output-schema.input';
import { WorkflowQueryValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-query-validation-graphql-api-exception.filter';
import { WorkflowTriggerGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-graphql-api-exception.filter';
import { msg } from '@lingui/core/macro';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { CoreWorkflowVersionListService } from 'src/engine/core-modules/workflow/services/core-workflow-version-list.service';
import { type CoreWorkflowReadCaller } from 'src/engine/core-modules/workflow/types/core-workflow-read-caller.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/permissions/utils/permissions-graphql-api-exception.filter';
import { type OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@CoreResolver()
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
@UsePipes(ResolverValidationPipe)
@UseFilters(
  WorkflowTriggerGraphqlApiExceptionFilter,
  WorkflowQueryValidationGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  AuthGraphqlApiExceptionFilter,
)
export class WorkflowBuilderResolver {
  constructor(
    private readonly workflowSchemaWorkspaceService: WorkflowSchemaWorkspaceService,
    private readonly coreWorkflowVersionListService: CoreWorkflowVersionListService,
  ) {}

  @Mutation(() => graphqlTypeJson)
  async computeStepOutputSchema(
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callerApplication: FlatApplication | undefined,
    @Args('input')
    { step, coreWorkflowVersionId }: ComputeStepOutputSchemaInput,
  ): Promise<OutputSchema> {
    return this.workflowSchemaWorkspaceService.computeStepOutputSchema({
      step,
      workspaceId,
      workflowVersionContent: await this.resolveWorkflowVersionContent({
        workspaceId,
        userWorkspaceId,
        callerApplication,
        workspaceCustomApplicationId,
        coreWorkflowVersionId,
      }),
    });
  }

  private async resolveWorkflowVersionContent({
    workspaceId,
    userWorkspaceId,
    callerApplication,
    workspaceCustomApplicationId,
    coreWorkflowVersionId,
  }: CoreWorkflowReadCaller & {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowVersionId?: string;
  }): Promise<
    | { trigger: WorkflowTrigger | null; steps: WorkflowAction[] | null }
    | undefined
  > {
    if (!isDefined(coreWorkflowVersionId)) {
      return undefined;
    }

    const coreWorkflowVersion =
      await this.coreWorkflowVersionListService.findOneByCoreWorkflowVersionId({
        workspaceId,
        userWorkspaceId,
        callerApplication,
        workspaceCustomApplicationId,
        coreWorkflowVersionId,
      });

    if (!isDefined(coreWorkflowVersion)) {
      throw new WorkflowQueryValidationException(
        `Core workflow version '${coreWorkflowVersionId}' not found`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Workflow version not found`,
        },
      );
    }

    return {
      trigger: coreWorkflowVersion.trigger,
      steps: coreWorkflowVersion.steps,
    };
  }
}
