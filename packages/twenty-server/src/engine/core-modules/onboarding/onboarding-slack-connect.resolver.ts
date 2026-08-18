import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { AppPath } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { OnboardingSlackAuthorizationDTO } from 'src/engine/core-modules/onboarding/dtos/onboarding-slack-authorization.dto';
import { OnboardingStepSuccessDTO } from 'src/engine/core-modules/onboarding/dtos/onboarding-step-success.dto';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { OnboardingSlackAvailabilityService } from 'src/engine/core-modules/onboarding/services/onboarding-slack-availability.service';
import { OnboardingSlackConnectService } from 'src/engine/core-modules/onboarding/services/onboarding-slack-connect.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
@MetadataResolver()
export class OnboardingSlackConnectResolver {
  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly onboardingSlackConnectService: OnboardingSlackConnectService,
    private readonly onboardingSlackAvailabilityService: OnboardingSlackAvailabilityService,
  ) {}

  @Query(() => Boolean)
  @UseGuards(NoPermissionGuard)
  async isConnectSlackOnboardingStepAvailable(): Promise<boolean> {
    return this.onboardingSlackAvailabilityService.isSlackConnectAvailable();
  }

  // Installs the Slack app in the workspace if needed and hands back the Slack
  // authorization URL. The onboarding step itself is only completed once Slack
  // redirects back with a connection, so abandoning the consent screen leaves
  // the user on the step.
  @Mutation(() => OnboardingSlackAuthorizationDTO)
  @UseGuards(NoPermissionGuard)
  async startConnectSlackOnboardingStep(
    @AuthUser() user: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<OnboardingSlackAuthorizationDTO> {
    return this.onboardingSlackConnectService.startAuthorizationFlow({
      userId: user.id,
      workspaceId: workspace.id,
      userWorkspaceId,
      redirectLocation: AppPath.Index,
    });
  }

  @Mutation(() => OnboardingStepSuccessDTO)
  @UseGuards(NoPermissionGuard)
  async skipConnectSlackOnboardingStep(
    @AuthUser() user: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args({ name: 'isAutoSkipped', type: () => Boolean, defaultValue: false })
    isAutoSkipped: boolean,
  ): Promise<OnboardingStepSuccessDTO> {
    await this.onboardingService.skipConnectSlackOnboardingStep({
      userId: user.id,
      workspaceId: workspace.id,
      isAutoSkipped,
    });

    return { success: true };
  }
}
