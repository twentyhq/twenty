import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Mutation, Query } from '@nestjs/graphql';

import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { GettingStartedProgressDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-progress.dto';
import { UpdateGettingStartedInput } from 'src/engine/core-modules/getting-started/dtos/update-getting-started.input';
import { GettingStartedService } from 'src/engine/core-modules/getting-started/services/getting-started.service';
import { type GettingStartedProgress } from 'src/engine/core-modules/getting-started/types/getting-started-progress.type';
import { buildGettingStartedStepDefinition } from 'src/engine/core-modules/getting-started/utils/build-getting-started-step-definition.util';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { BillingEnabledGuard } from 'src/engine/guards/billing-enabled.guard';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@MetadataResolver()
@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: false,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    },
    requiredPermissionFlags: [],
    requiredFeatureFlags: [FeatureFlagKey.IS_GETTING_STARTED_ENABLED],
  }),
  BillingEnabledGuard,
)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class GettingStartedResolver {
  constructor(
    private readonly gettingStartedService: GettingStartedService,
    private readonly i18nService: I18nService,
  ) {}

  @Query(() => GettingStartedProgressDTO)
  async gettingStartedProgress(
    @AuthUser() user: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Context() context: I18nContext,
  ): Promise<GettingStartedProgressDTO> {
    const progress = await this.gettingStartedService.getProgress({
      userId: user.id,
      userEmail: user.email,
      workspaceId: workspace.id,
      userWorkspaceId,
    });

    return this.buildProgressDTO({ progress, locale: context.req.locale });
  }

  @Mutation(() => GettingStartedProgressDTO)
  async updateGettingStarted(
    @AuthUser() user: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('input') input: UpdateGettingStartedInput,
    @Context() context: I18nContext,
  ): Promise<GettingStartedProgressDTO> {
    const progress = await this.gettingStartedService.updateProgress({
      userId: user.id,
      userEmail: user.email,
      workspaceId: workspace.id,
      userWorkspaceId,
      input,
    });

    return this.buildProgressDTO({ progress, locale: context.req.locale });
  }

  private buildProgressDTO({
    progress,
    locale,
  }: {
    progress: GettingStartedProgress;
    locale: I18nContext['req']['locale'];
  }): GettingStartedProgressDTO {
    const i18nInstance = this.i18nService.getI18nInstance(locale);
    const {
      companyEnrichment,
      stepActionKeys,
      chatThreadIdByStepActionKey,
      workflowIdByStepActionKey,
      ...progressFields
    } = progress;

    return {
      ...progressFields,
      steps: stepActionKeys.map((stepActionKey) =>
        buildGettingStartedStepDefinition({
          stepActionKey,
          companyEnrichment,
          doneChatThreadId: chatThreadIdByStepActionKey[stepActionKey] ?? null,
          doneWorkflowId: workflowIdByStepActionKey[stepActionKey] ?? null,
          translate: (descriptor) => i18nInstance._(descriptor),
        }),
      ),
    };
  }
}
