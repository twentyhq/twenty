import { AuthExceptionCode } from 'src/engine/core-modules/auth/auth.exception';
import { hashPassword } from 'src/engine/core-modules/auth/auth.util';
import { assertUserPasswordIsValidOrThrow } from 'src/engine/core-modules/auth/utils/assert-user-password-is-valid-or-throw.util';

describe('assertUserPasswordIsValidOrThrow', () => {
  it('accepts the right password', async () => {
    const passwordHash = await hashPassword('right-password');

    await expect(
      assertUserPasswordIsValidOrThrow({
        user: { passwordHash },
        password: 'right-password',
      }),
    ).resolves.toBeUndefined();
  });

  it('rejects a wrong password', async () => {
    const passwordHash = await hashPassword('right-password');

    await expect(
      assertUserPasswordIsValidOrThrow({
        user: { passwordHash },
        password: 'wrong-password',
      }),
    ).rejects.toMatchObject({ code: AuthExceptionCode.FORBIDDEN_EXCEPTION });
  });

  it('rejects a user created without a password', async () => {
    await expect(
      assertUserPasswordIsValidOrThrow({
        user: { passwordHash: '' },
        password: 'any-password',
      }),
    ).rejects.toMatchObject({ code: AuthExceptionCode.INVALID_INPUT });
  });
});
