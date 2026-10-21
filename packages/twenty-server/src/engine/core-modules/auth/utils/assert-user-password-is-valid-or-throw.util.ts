import { msg } from '@lingui/core/macro';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { compareHash } from 'src/engine/core-modules/auth/auth.util';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';

export const assertUserPasswordIsValidOrThrow = async ({
  user,
  password,
}: {
  user: Pick<UserEntity, 'passwordHash'>;
  password: string;
}): Promise<void> => {
  if (!user.passwordHash) {
    throw new AuthException(
      'Incorrect login method',
      AuthExceptionCode.INVALID_INPUT,
      {
        userFriendlyMessage: msg`User was not created with email/password`,
      },
    );
  }

  const isValid = await compareHash(password, user.passwordHash);

  if (!isValid) {
    throw new AuthException(
      'Wrong password',
      AuthExceptionCode.FORBIDDEN_EXCEPTION,
      {
        userFriendlyMessage: msg`Wrong password.`,
      },
    );
  }
};
