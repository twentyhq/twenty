import { isRefreshTokenCoveredByAuthorization } from 'src/engine/core-modules/application/application-authorization/utils/is-refresh-token-covered-by-authorization.util';

const LAST_AUTHORIZED_AT = new Date('2026-10-31T12:00:00.500Z');
const LAST_AUTHORIZED_AT_IN_SECONDS = Math.floor(
  LAST_AUTHORIZED_AT.getTime() / 1000,
);

describe('isRefreshTokenCoveredByAuthorization', () => {
  it('honours a refresh token issued since the latest consent', () => {
    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: {
          revokedAt: null,
          lastAuthorizedAt: LAST_AUTHORIZED_AT,
        },
        refreshTokenIssuedAt: LAST_AUTHORIZED_AT_IN_SECONDS,
      }),
    ).toBe(true);
  });

  it('rejects a refresh token issued before the latest consent', () => {
    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: {
          revokedAt: null,
          lastAuthorizedAt: LAST_AUTHORIZED_AT,
        },
        refreshTokenIssuedAt: LAST_AUTHORIZED_AT_IN_SECONDS - 1,
      }),
    ).toBe(false);
  });

  it('rejects any refresh token of a revoked grant, and one without an issue time', () => {
    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: { revokedAt: new Date(), lastAuthorizedAt: null },
        refreshTokenIssuedAt: LAST_AUTHORIZED_AT_IN_SECONDS,
      }),
    ).toBe(false);
    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: {
          revokedAt: null,
          lastAuthorizedAt: LAST_AUTHORIZED_AT,
        },
        refreshTokenIssuedAt: undefined,
      }),
    ).toBe(false);
  });

  it('honours tokens of a grant backfilled without a consent time', () => {
    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: { revokedAt: null, lastAuthorizedAt: null },
        refreshTokenIssuedAt: undefined,
      }),
    ).toBe(true);
  });
});
