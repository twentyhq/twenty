import { UseGuards } from '@nestjs/common';
import { Mutation, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import {
  EmailSyncStatus,
  KeyValuePairService,
  KeyValuePairsKeys,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { KeyValuePairCreated } from 'src/engine/core-modules/key-value-pair/dtos/key-value-pair-created.entity';
import { User } from 'src/engine/core-modules/user/user.entity';

@UseGuards(JwtAuthGuard)
@Resolver(() => KeyValuePair)
export class KeyValuePairResolver {
  constructor(private readonly keyValuePairService: KeyValuePairService) {}

  @Mutation(() => KeyValuePairCreated)
  async skipSyncEmail(@AuthUser() user: User): Promise<KeyValuePairCreated> {
    return await this.keyValuePairService.set(
      user.id,
      user.defaultWorkspaceId,
      {
        key: KeyValuePairsKeys.EMAIL_SYNC_ONBOARDING_STEP,
        value: EmailSyncStatus.SKIPPED,
      },
    );
  }
}
