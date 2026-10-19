import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { RunCoreWorkflowVersionInput } from 'src/engine/core-modules/workflow/dtos/run-core-workflow-version.input';
import { RunWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/run-workflow-version.dto';
import { WorkflowQueryValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-query-validation-graphql-api-exception.filter';
import { WorkflowTriggerGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-graphql-api-exception.filter';
import { WorkflowVersionEdgeGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-edge-graphql-api-exception.filter';
import { WorkflowVersionStepGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-step-graphql-api-exception.filter';
import { WorkflowVersionValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-validation-graphql-api-exception.filter';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { CoreWorkflowRunnerService } from 'src/modules/workflow/workflow-runner/services/core-workflow-runner.service';
import { buildWorkflowRunTriggerContext } from 'src/modules/workflow/workflow-trigger/utils/build-workflow-run-trigger-context.util';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

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
  WorkflowQueryValidationGraphqlApiExceptionFilter,
  WorkflowTriggerGraphqlApiExceptionFilter,
  WorkflowVersionEdgeGraphqlApiExceptionFilter,
  WorkflowVersionStepGraphqlApiExceptionFilter,
  WorkflowVersionValidationGraphqlApiExceptionFilter,
)
export class CoreWorkflowRunResolver {
  constructor(
    private readonly coreWorkflowRunnerService: CoreWorkflowRunnerService,
    private readonly coreWorkflowAccessService: CoreWorkflowAccessService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  @Mutation(() => RunWorkflowVersionDTO)
  async runCoreWorkflowVersion(
    @AuthUser() user: AuthContextUser,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthApplication({ allowUndefined: true })
    callerApplication: FlatApplication | undefined,
    @Args('input')
    {
      coreWorkflowVersionId,
      workflowRunId,
      payload,
    }: RunCoreWorkflowVersionInput,
  ): Promise<RunWorkflowVersionDTO> {
    const workspaceMember =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workspaceMemberRepository =
          this.workspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        return workspaceMemberRepository.findOneOrFail({
          where: { userId: user.id },
        });
      }, buildSystemAuthContext(workspaceId));

    await this.coreWorkflowAccessService.assertCoreWorkflowVersionsAreAccessibleOrThrow(
      {
        workspaceId,
        userWorkspaceId,
        coreWorkflowVersionIds: [coreWorkflowVersionId],
      },
    );

    await this.coreWorkflowAccessService.assertCoreWorkflowVersionsAreStartableByApplicationOrThrow(
      {
        workspaceId,
        callerApplicationId: callerApplication?.id,
        coreWorkflowVersionIds: [coreWorkflowVersionId],
      },
    );

    const { payload: triggerPayload, createdBy } =
      buildWorkflowRunTriggerContext({
        workspaceMember,
        payload,
      });

    return this.coreWorkflowRunnerService.run({
      workspaceId,
      coreWorkflowVersionId,
      workflowRunId: workflowRunId ?? undefined,
      payload: triggerPayload,
      source: createdBy,
    });
  }
}
