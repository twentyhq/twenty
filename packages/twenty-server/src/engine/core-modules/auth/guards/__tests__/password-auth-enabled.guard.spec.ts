import { GqlExecutionContext } from '@nestjs/graphql';

import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { PasswordAuthEnabledGuard } from 'src/engine/core-modules/auth/guards/password-auth-enabled.guard';

jest.mock('@nestjs/graphql', () => {
  const actual = jest.requireActual('@nestjs/graphql');

  return {
    ...actual,
    GqlExecutionContext: {
      create: jest.fn(),
    },
  };
});

const mockGetArgs = (args: Record<string, unknown>) => {
  (GqlExecutionContext.create as jest.Mock).mockReturnValue({
    getArgs: () => args,
  });
};

const createGuard = (
  config: { passwordEnabled: boolean; breakGlassEmails?: string },
  verifyLoginToken: jest.Mock = jest.fn(),
) => {
  const twentyConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'AUTH_PASSWORD_ENABLED') return config.passwordEnabled;
      if (key === 'AUTH_BREAK_GLASS_EMAILS') return config.breakGlassEmails;
      return undefined;
    }),
  };

  const loginTokenService = { verifyLoginToken };

  return {
    guard: new PasswordAuthEnabledGuard(
      twentyConfigService as any,
      loginTokenService as any,
    ),
    verifyLoginToken,
  };
};

const runCanActivate = (guard: PasswordAuthEnabledGuard) =>
  guard.canActivate({} as any);

describe('PasswordAuthEnabledGuard', () => {
  describe('when AUTH_PASSWORD_ENABLED is true (default config)', () => {
    it('allows every request without touching the args', async () => {
      const { guard } = createGuard({ passwordEnabled: true });

      await expect(runCanActivate(guard)).resolves.toBe(true);
    });
  });

  describe('when AUTH_PASSWORD_ENABLED is false', () => {
    it('rejects when the args carry no email', async () => {
      const { guard } = createGuard({ passwordEnabled: false });

      mockGetArgs({ origin: 'https://crm.crove.com' });

      await expect(runCanActivate(guard)).rejects.toThrow(AuthException);
    });

    it('rejects an email that is not on the allowlist', async () => {
      const { guard } = createGuard({
        passwordEnabled: false,
        breakGlassEmails: 'admin@dos.ai',
      });

      mockGetArgs({ email: 'user@example.com', password: 'secret' });

      await expect(runCanActivate(guard)).rejects.toThrow(AuthException);
    });

    it('allows an allowlisted email (break-glass sign-in)', async () => {
      const { guard } = createGuard({
        passwordEnabled: false,
        breakGlassEmails: 'admin@dos.ai,ops@dos.ai',
      });

      mockGetArgs({ email: 'ops@dos.ai', password: 'secret' });

      await expect(runCanActivate(guard)).resolves.toBe(true);
    });

    it('matches the allowlist case-insensitively', async () => {
      const { guard } = createGuard({
        passwordEnabled: false,
        breakGlassEmails: 'Admin@DOS.ai',
      });

      mockGetArgs({ email: 'admin@dos.ai', password: 'secret' });

      await expect(runCanActivate(guard)).resolves.toBe(true);
    });

    it('rejects when the allowlist is not armed', async () => {
      const { guard } = createGuard({ passwordEnabled: false });

      mockGetArgs({ email: 'admin@dos.ai', password: 'secret' });

      await expect(runCanActivate(guard)).rejects.toThrow(AuthException);
    });

    it('resolves the email from a valid loginToken (OTP exchange)', async () => {
      const verifyLoginToken = jest.fn().mockResolvedValue({
        sub: 'admin@dos.ai',
        type: 'LOGIN',
        authProvider: 'password',
      });
      const { guard } = createGuard(
        {
          passwordEnabled: false,
          breakGlassEmails: 'admin@dos.ai',
        },
        verifyLoginToken,
      );

      mockGetArgs({ loginToken: 'valid.jwt.token', otp: '123456' });

      await expect(runCanActivate(guard)).resolves.toBe(true);
      expect(verifyLoginToken).toHaveBeenCalledWith('valid.jwt.token');
    });

    it('rejects when the loginToken fails verification', async () => {
      const verifyLoginToken = jest
        .fn()
        .mockRejectedValue(new Error('invalid signature'));
      const { guard } = createGuard(
        {
          passwordEnabled: false,
          breakGlassEmails: 'admin@dos.ai',
        },
        verifyLoginToken,
      );

      mockGetArgs({ loginToken: 'forged.jwt.token', otp: '123456' });

      await expect(runCanActivate(guard)).rejects.toThrow(AuthException);
    });
  });
});
