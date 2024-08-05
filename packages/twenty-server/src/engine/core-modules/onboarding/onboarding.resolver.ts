import { UseGuards } from '@nestjs/common';
import { Mutation, Resolver } from '@nestjs/graphql';

import { OnboardingStepSuccess } from 'src/engine/core-modules/onboarding/dtos/onboarding-step-success.dto';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';

@UseGuards(JwtAuthGuard)
@Resolver()
export class OnboardingResolver {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Mutation(() => OnboardingStepSuccess)
  async skipSyncEmailOnboardingStep(
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<OnboardingStepSuccess> {
    await this.onboardingService.setOnboardingConnectAccountPending({
      userId: user.id,
      workspaceId: workspace.id,
      value: false,
    });

    return { success: true };
  }
}
