import { UseGuards } from '@nestjs/common';
import { Mutation, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { UserState } from 'src/engine/core-modules/user-state/dtos/user-state.dto';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { User } from 'src/engine/core-modules/user/user.entity';
import { UserStateService } from 'src/engine/core-modules/user-state/user-state.service';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { SkipSyncEmailOnboardingStep } from 'src/engine/core-modules/user-state/dtos/skip-sync-email.entity-onboarding-step';

@UseGuards(JwtAuthGuard)
@Resolver(() => UserState)
export class UserStateResolver {
  constructor(private readonly userStateService: UserStateService) {}

  @Mutation(() => SkipSyncEmailOnboardingStep)
  async skipSyncEmailOnboardingStep(
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<SkipSyncEmailOnboardingStep> {
    return await this.userStateService.skipSyncEmailOnboardingStep(
      user.id,
      workspace.id,
    );
  }
}
