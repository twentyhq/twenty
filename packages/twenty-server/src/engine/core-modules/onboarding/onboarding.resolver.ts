import { UseGuards } from '@nestjs/common';
import { Mutation, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { OnboardingResult } from 'src/engine/core-modules/onboarding/dtos/onboarding-result.dto';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { User } from 'src/engine/core-modules/user/user.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { OnboardingStepKeys } from 'src/engine/core-modules/key-value-pair/enums/keys/onboarding-step-keys.enum';

@UseGuards(JwtAuthGuard)
@Resolver()
export class OnboardingResolver {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Mutation(() => OnboardingResult)
  async skipSyncEmailOnboardingStep(
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<OnboardingResult> {
    await this.onboardingService.skipOnboardingStep(
      user.id,
      workspace.id,
      OnboardingStepKeys.SYNC_EMAIL_ONBOARDING_STEP,
    );

    return { success: true };
  }
}
