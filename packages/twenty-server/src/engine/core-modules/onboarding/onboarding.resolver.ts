import { UseGuards } from '@nestjs/common';
import { Mutation, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { OnboardingStepSuccess } from 'src/engine/core-modules/onboarding/dtos/onboarding-step-success.dto';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { User } from 'src/engine/core-modules/user/user.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';

@UseGuards(JwtAuthGuard)
@Resolver()
export class OnboardingResolver {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Mutation(() => OnboardingStepSuccess)
  async skipSyncEmailOnboardingStep(
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<OnboardingStepSuccess> {
    await this.onboardingService.skipSyncEmailOnboardingStep(
      user.id,
      workspace.id,
    );

    return { success: true };
  }
}
