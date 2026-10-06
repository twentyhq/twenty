import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { RunWorkflowVersionInput } from 'src/engine/core-modules/workflow/dtos/run-workflow-version.input';
import { RunWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/run-workflow-version.dto';
import { WorkflowRunDTO } from 'src/engine/core-modules/workflow/dtos/workflow-run.dto';
import { WorkflowQueryValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-query-validation-graphql-api-exception.filter';
import { WorkflowTriggerGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-graphql-api-exception.filter';
import { WorkflowVersionValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-validation-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { buildWorkflowRunTriggerContext } from 'src/modules/workflow/workflow-trigger/utils/build-workflow-run-trigger-context.util';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@CoreResolver()
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
  SettingsPermissionGuard(PermissionFlagType.WORKFLOWS),
)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  WorkflowTriggerGraphqlApiExceptionFilter,
  WorkflowQueryValidationGraphqlApiExceptionFilter,
  WorkflowVersionValidationGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  AuthGraphqlApiExceptionFilter,
)
export class WorkflowTriggerResolver {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    private readonly coreWorkflowAccessService: CoreWorkflowAccessService,
  ) {}

  @Mutation(() => RunWorkflowVersionDTO)
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
  )
  async runWorkflowVersion(
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthUser() user: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callerApplication: FlatApplication | undefined,
    @Args('input')
    { workflowVersionId, workflowRunId, payload }: RunWorkflowVersionInput,
  ) {
    await this.coreWorkflowAccessService.assertWorkspaceWorkflowVersionsAreAccessibleOrThrow(
      {
        workspaceId: workspace.id,
        userWorkspaceId,
        workspaceWorkflowVersionIds: [workflowVersionId],
      },
    );

    await this.coreWorkflowAccessService.assertWorkspaceWorkflowVersionsAreStartableByApplicationOrThrow(
      {
        workspaceId: workspace.id,
        callerApplicationId: callerApplication?.id,
        workspaceWorkflowVersionIds: [workflowVersionId],
      },
    );

    const authContext = buildSystemAuthContext(workspace.id);

    const workspaceMember =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workspaceMemberRepository =
          this.workspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        return workspaceMemberRepository.findOneOrFail({
          where: {
            userId: user.id,
          },
        });
      }, authContext);

    const { payload: triggerPayload, createdBy } =
      buildWorkflowRunTriggerContext({
        workspaceMember,
        payload,
        startingApplicationId: callerApplication?.id,
      });

    return this.workflowRunnerWorkspaceService.run({
      workflowVersionId,
      workflowRunId: workflowRunId ?? undefined,
      payload: triggerPayload,
      source: createdBy,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => WorkflowRunDTO)
  async stopWorkflowRun(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('workflowRunId', { type: () => UUIDScalarType })
    workflowRunId: string,
  ) {
    return this.workflowRunnerWorkspaceService.stopWorkflowRun(
      workspace.id,
      workflowRunId,
    );
  }

  @Mutation(() => WorkflowRunDTO)
  async retryWorkflowRun(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('workflowRunId', { type: () => UUIDScalarType })
    workflowRunId: string,
  ) {
    return this.workflowRunnerWorkspaceService.retryWorkflowRun(
      workspace.id,
      workflowRunId,
    );
  }
}
