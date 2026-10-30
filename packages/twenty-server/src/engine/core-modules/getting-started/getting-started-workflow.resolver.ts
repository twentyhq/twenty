import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { GETTING_STARTED_WORKFLOWS } from 'src/engine/core-modules/getting-started/constants/getting-started-workflows.constant';
import { GettingStartedWorkflowPreviewDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-workflow-preview.dto';
import { GettingStartedWorkflowDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-workflow.dto';
import { GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';
import { GettingStartedGraphqlApiExceptionFilter } from 'src/engine/core-modules/getting-started/filters/getting-started-graphql-api-exception.filter';
import { GettingStartedWorkflowWorkspaceService } from 'src/engine/core-modules/getting-started/services/getting-started-workflow.workspace-service';
import { buildGettingStartedWorkflowPreview } from 'src/engine/core-modules/getting-started/utils/build-getting-started-workflow-preview.util';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkflowQueryValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-query-validation-graphql-api-exception.filter';
import { WorkflowTriggerGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-graphql-api-exception.filter';
import { WorkflowVersionValidationGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-version-validation-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { BillingEnabledGuard } from 'src/engine/guards/billing-enabled.guard';
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
  BillingEnabledGuard,
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
    private readonly i18nService: I18nService,
  ) {}

  @Query(() => [GettingStartedWorkflowPreviewDTO])
  gettingStartedWorkflowPreviews(
    @Context() context: I18nContext,
  ): GettingStartedWorkflowPreviewDTO[] {
    const i18nInstance = this.i18nService.getI18nInstance(context.req.locale);

    return Object.values(GettingStartedStepActionKey).flatMap(
      (stepActionKey) => {
        const gettingStartedWorkflow = GETTING_STARTED_WORKFLOWS[stepActionKey];

        return isDefined(gettingStartedWorkflow)
          ? [
              buildGettingStartedWorkflowPreview({
                stepActionKey,
                gettingStartedWorkflow,
                translate: (descriptor) => i18nInstance._(descriptor),
              }),
            ]
          : [];
      },
    );
  }

  @Mutation(() => GettingStartedWorkflowDTO)
  async prepareGettingStartedWorkflow(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('stepActionKey', { type: () => GettingStartedStepActionKey })
    stepActionKey: GettingStartedStepActionKey,
  ): Promise<GettingStartedWorkflowDTO> {
    return this.gettingStartedWorkflowWorkspaceService.prepareWorkflowOrThrow({
      workspaceId: workspace.id,
      userWorkspaceId,
      stepActionKey,
    });
  }
}
