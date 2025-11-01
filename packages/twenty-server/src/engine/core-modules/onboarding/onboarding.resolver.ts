import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Mutation, Resolver } from '@nestjs/graphql';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { OnboardingStepSuccessDTO } from 'src/engine/core-modules/onboarding/dtos/onboarding-step-success.dto';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
@Resolver()
export class OnboardingResolver {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Mutation(() => OnboardingStepSuccessDTO)
  @UseGuards(NoPermissionGuard)
  async skipSyncEmailOnboardingStep(
    @AuthUser() user: UserEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<OnboardingStepSuccessDTO> {
    await this.onboardingService.setOnboardingConnectAccountPending({
      userId: user.id,
      workspaceId: workspace.id,
      value: false,
    });

    return { success: true };
  }

  @Mutation(() => OnboardingStepSuccessDTO)
  @UseGuards(NoPermissionGuard)
  async skipBookOnboardingStep(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<OnboardingStepSuccessDTO> {
    await this.onboardingService.setOnboardingBookOnboardingPending({
      workspaceId: workspace.id,
      value: false,
    });

    return { success: true };
  }
}
