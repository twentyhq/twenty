import { isRefreshTokenCoveredByAuthorization } from 'src/engine/core-modules/application/application-authorization/utils/is-refresh-token-covered-by-authorization.util';

const AUTHORIZED_AT = new Date('2026-01-01T00:00:10.500Z');
const AUTHORIZED_AT_SECONDS = Math.floor(AUTHORIZED_AT.getTime() / 1000);

describe('isRefreshTokenCoveredByAuthorization', () => {
  it('should cover a token issued in or after the second the authorization started', () => {
    for (const iat of [AUTHORIZED_AT_SECONDS, AUTHORIZED_AT_SECONDS + 60]) {
      expect(
        isRefreshTokenCoveredByAuthorization({
          authorization: { revokedAt: null, lastAuthorizedAt: AUTHORIZED_AT },
          refreshToken: { iat },
        }),
      ).toBe(true);
    }
  });

  it('should not cover a token issued before the authorization started', () => {
    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: { revokedAt: null, lastAuthorizedAt: AUTHORIZED_AT },
        refreshToken: { iat: AUTHORIZED_AT_SECONDS - 1 },
      }),
    ).toBe(false);
  });

  it('should not cover a token without an issue time once the authorization has a start', () => {
    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: { revokedAt: null, lastAuthorizedAt: AUTHORIZED_AT },
        refreshToken: {},
      }),
    ).toBe(false);
  });

  it('should not cover any token of a revoked authorization', () => {
    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: {
          revokedAt: new Date('2026-01-02T00:00:00.000Z'),
          lastAuthorizedAt: AUTHORIZED_AT,
        },
        refreshToken: { iat: AUTHORIZED_AT_SECONDS + 60 },
      }),
    ).toBe(false);
  });

  it('should cover any token of an authorization backfilled without a start', () => {
    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: { revokedAt: null, lastAuthorizedAt: null },
        refreshToken: { iat: 1 },
      }),
    ).toBe(true);
  });
});
