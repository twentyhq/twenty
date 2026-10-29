import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { GettingStartedWorkflowDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-workflow.dto';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import { GettingStartedGraphqlApiExceptionFilter } from 'src/engine/core-modules/getting-started/filters/getting-started-graphql-api-exception.filter';
import { GettingStartedWorkflowWorkspaceService } from 'src/engine/core-modules/getting-started/services/getting-started-workflow.workspace-service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { WorkflowQueryValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-query-validation-graphql-api-exception.filter';
import { WorkflowTriggerGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-graphql-api-exception.filter';
import { WorkflowVersionValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-validation-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { FeatureFlagGuard } from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@MetadataResolver()
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: false,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  }),
  FeatureFlagGuard(FeatureFlagKey.IS_GETTING_STARTED_ENABLED),
  SettingsPermissionGuard(PermissionFlagType.WORKFLOWS),
)
@UseFilters(
  GettingStartedGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  WorkflowQueryValidationGraphqlApiExceptionFilter,
  WorkflowTriggerGraphqlApiExceptionFilter,
  WorkflowVersionValidationGraphqlApiExceptionFilter,
)
export class GettingStartedWorkflowResolver {
  constructor(
    private readonly gettingStartedWorkflowWorkspaceService: GettingStartedWorkflowWorkspaceService,
  ) {}

  @Mutation(() => GettingStartedWorkflowDTO)
  async prepareGettingStartedWorkflow(
    @AuthUser() user: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('step', { type: () => GettingStartedStep }) step: GettingStartedStep,
    @Args('activate', { type: () => Boolean }) activate: boolean,
  ): Promise<GettingStartedWorkflowDTO> {
    return this.gettingStartedWorkflowWorkspaceService.prepareWorkflow({
      userId: user.id,
      workspaceId: workspace.id,
      userWorkspaceId,
      step,
      activate,
    });
  }
}
