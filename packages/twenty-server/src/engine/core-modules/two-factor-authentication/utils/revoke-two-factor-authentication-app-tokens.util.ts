import { IsNull, type Repository } from 'typeorm';

import {
  type AppTokenEntity,
  type AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export const revokeTwoFactorAuthenticationAppTokens = async ({
  appTokenRepository,
  userId,
  workspaceId,
  type,
  includeRedeemed = false,
}: {
  appTokenRepository: Repository<AppTokenEntity>;
  userId: UserEntity['id'];
  workspaceId: WorkspaceEntity['id'];
  type:
    | AppTokenType.TwoFactorAuthenticationRecoveryCode
    | AppTokenType.TwoFactorAuthenticationBackupCode;
  includeRedeemed?: boolean;
}): Promise<number> => {
  const updateResult = await appTokenRepository.update(
    {
      userId,
      workspaceId,
      type,
      revokedAt: IsNull(),
      ...(includeRedeemed ? {} : { deletedAt: IsNull() }),
    },
    { revokedAt: new Date() },
  );

  return updateResult.affected ?? 0;
};
