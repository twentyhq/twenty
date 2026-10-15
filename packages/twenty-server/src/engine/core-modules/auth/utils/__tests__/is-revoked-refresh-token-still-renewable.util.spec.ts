import { isRevokedRefreshTokenStillRenewable } from 'src/engine/core-modules/auth/utils/is-revoked-refresh-token-still-renewable.util';
import { UserSessionRevokedReason } from 'src/engine/core-modules/user-session/types/user-session-revoked-reason.type';

describe('isRevokedRefreshTokenStillRenewable', () => {
  const now = new Date('2026-01-01T12:00:00.000Z');

  it('accepts a token rotated moments ago by a concurrent renewal', () => {
    expect(
      isRevokedRefreshTokenStillRenewable({
        revokedAt: new Date(now.getTime() - 10 * 1000),
        revokedReason: undefined,
        reuseGracePeriod: '1m',
        now,
      }),
    ).toBe(true);
  });

  it('rejects a token revoked before the reuse grace period', () => {
    expect(
      isRevokedRefreshTokenStillRenewable({
        revokedAt: new Date(now.getTime() - 5 * 60 * 1000),
        revokedReason: undefined,
        reuseGracePeriod: '1m',
        now,
      }),
    ).toBe(false);
  });

  it('rejects a token revoked for a security reason even inside the reuse grace period', () => {
    expect(
      isRevokedRefreshTokenStillRenewable({
        revokedAt: new Date(now.getTime() - 10 * 1000),
        revokedReason: UserSessionRevokedReason.TwoFactorAuthenticationReset,
        reuseGracePeriod: '1m',
        now,
      }),
    ).toBe(false);
  });
});
