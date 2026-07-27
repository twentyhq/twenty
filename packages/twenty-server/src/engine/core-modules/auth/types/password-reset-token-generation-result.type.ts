import { type PasswordResetToken } from 'src/engine/core-modules/auth/types/password-reset-token.type';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export type PasswordResetTokenGenerationResult =
  | {
      status: 'TOKEN_GENERATED';
      resetToken: PasswordResetToken;
      user: UserEntity;
      workspace: WorkspaceEntity;
    }
  | { status: 'USER_NOT_FOUND' }
  | { status: 'NO_PASSWORD_AUTH_ENABLED_WORKSPACE_FOUND' }
  | { status: 'TOKEN_ALREADY_GENERATED' };
