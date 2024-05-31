import { UseGuards } from '@nestjs/common';
import { Mutation, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { UserState } from 'src/engine/core-modules/user/dtos/user-state.dto';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { User } from 'src/engine/core-modules/user/user.entity';
import { UserStateService } from 'src/engine/core-modules/user/services/user-state.service';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { SkipSyncEmail } from 'src/engine/core-modules/user/dtos/skip-sync-email.entity';

@UseGuards(JwtAuthGuard)
@Resolver(() => UserState)
export class UserStateResolver {
  constructor(private readonly userStateService: UserStateService) {}

  @Mutation(() => SkipSyncEmail)
  async skipSyncEmail(
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<SkipSyncEmail> {
    return await this.userStateService.skipSyncEmail(user.id, workspace.id);
  }
}
