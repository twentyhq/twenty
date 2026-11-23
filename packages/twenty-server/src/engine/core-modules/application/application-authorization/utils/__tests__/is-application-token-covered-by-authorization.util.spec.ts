import { isApplicationTokenCoveredByAuthorization } from 'src/engine/core-modules/application/application-authorization/utils/is-application-token-covered-by-authorization.util';

const AUTHORIZED_AT = new Date('2026-01-01T00:00:10.500Z');
const AUTHORIZED_AT_SECONDS = Math.floor(AUTHORIZED_AT.getTime() / 1000);

describe('isApplicationTokenCoveredByAuthorization', () => {
  it('should cover a token issued in or after the second the authorization started', () => {
    for (const iat of [AUTHORIZED_AT_SECONDS, AUTHORIZED_AT_SECONDS + 60]) {
      expect(
        isApplicationTokenCoveredByAuthorization({
          authorization: { revokedAt: null, lastAuthorizedAt: AUTHORIZED_AT },
          token: { iat },
        }),
      ).toBe(true);
    }
  });

  it('should not cover a token issued before the authorization started', () => {
    expect(
      isApplicationTokenCoveredByAuthorization({
        authorization: { revokedAt: null, lastAuthorizedAt: AUTHORIZED_AT },
        token: { iat: AUTHORIZED_AT_SECONDS - 1 },
      }),
    ).toBe(false);
  });

  it('should not cover a token without an issue time once the authorization has a start', () => {
    expect(
      isApplicationTokenCoveredByAuthorization({
        authorization: { revokedAt: null, lastAuthorizedAt: AUTHORIZED_AT },
        token: {},
      }),
    ).toBe(false);
  });

  it('should not cover any token of a revoked authorization', () => {
    expect(
      isApplicationTokenCoveredByAuthorization({
        authorization: {
          revokedAt: new Date('2026-01-02T00:00:00.000Z'),
          lastAuthorizedAt: AUTHORIZED_AT,
        },
        token: { iat: AUTHORIZED_AT_SECONDS + 60 },
      }),
    ).toBe(false);
  });

  it('should cover any token of an authorization backfilled without a start', () => {
    expect(
      isApplicationTokenCoveredByAuthorization({
        authorization: { revokedAt: null, lastAuthorizedAt: null },
        token: { iat: 1 },
      }),
    ).toBe(true);
  });
});
