import { isRefreshTokenCoveredByAuthorization } from 'src/engine/core-modules/application/application-authorization/utils/is-refresh-token-covered-by-authorization.util';

const LAST_AUTHORIZED_AT = new Date('2026-10-31T12:00:00.500Z');
const LAST_AUTHORIZED_AT_IN_SECONDS = Math.floor(
  LAST_AUTHORIZED_AT.getTime() / 1000,
);
const CONSENT_ID = '0c6b8a4e-6a4f-4c39-9a51-0d2f1e3b7a10';
const EARLIER_CONSENT_ID = '7d0f3e2a-1b4c-4e5d-8f6a-9b0c1d2e3f40';

describe('isRefreshTokenCoveredByAuthorization', () => {
  it('honours a refresh token of the latest consent', () => {
    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: {
          revokedAt: null,
          lastAuthorizedAt: LAST_AUTHORIZED_AT,
          consentId: CONSENT_ID,
        },
        refreshToken: {
          iat: LAST_AUTHORIZED_AT_IN_SECONDS,
          consentId: CONSENT_ID,
        },
      }),
    ).toBe(true);
  });

  it('rejects a refresh token of an earlier consent made in the same second', () => {
    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: {
          revokedAt: null,
          lastAuthorizedAt: LAST_AUTHORIZED_AT,
          consentId: CONSENT_ID,
        },
        refreshToken: {
          iat: LAST_AUTHORIZED_AT_IN_SECONDS,
          consentId: EARLIER_CONSENT_ID,
        },
      }),
    ).toBe(false);
  });

  it('checks a token minted by a server without consent ids by its issue time, as during a rollout', () => {
    const grant = {
      revokedAt: null,
      lastAuthorizedAt: LAST_AUTHORIZED_AT,
      consentId: CONSENT_ID,
    };

    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: grant,
        refreshToken: { iat: LAST_AUTHORIZED_AT_IN_SECONDS },
      }),
    ).toBe(true);
    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: grant,
        refreshToken: { iat: LAST_AUTHORIZED_AT_IN_SECONDS - 1 },
      }),
    ).toBe(false);
  });

  it('rejects a token of the current consent issued before a later consent kept its id', () => {
    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: {
          revokedAt: null,
          lastAuthorizedAt: LAST_AUTHORIZED_AT,
          consentId: CONSENT_ID,
        },
        refreshToken: {
          iat: LAST_AUTHORIZED_AT_IN_SECONDS - 1,
          consentId: CONSENT_ID,
        },
      }),
    ).toBe(false);
  });

  it('rejects a token with a consent id on a grant that has none', () => {
    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: {
          revokedAt: null,
          lastAuthorizedAt: LAST_AUTHORIZED_AT,
          consentId: null,
        },
        refreshToken: {
          iat: LAST_AUTHORIZED_AT_IN_SECONDS,
          consentId: CONSENT_ID,
        },
      }),
    ).toBe(false);
  });

  it('falls back to the issue time for a grant consented before consent ids', () => {
    const grantWithoutConsentId = {
      revokedAt: null,
      lastAuthorizedAt: LAST_AUTHORIZED_AT,
      consentId: null,
    };

    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: grantWithoutConsentId,
        refreshToken: { iat: LAST_AUTHORIZED_AT_IN_SECONDS },
      }),
    ).toBe(true);
    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: grantWithoutConsentId,
        refreshToken: { iat: LAST_AUTHORIZED_AT_IN_SECONDS - 1 },
      }),
    ).toBe(false);
  });

  it('rejects any refresh token of a revoked grant, and one without an issue time', () => {
    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: {
          revokedAt: new Date(),
          lastAuthorizedAt: null,
          consentId: null,
        },
        refreshToken: { iat: LAST_AUTHORIZED_AT_IN_SECONDS },
      }),
    ).toBe(false);
    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: {
          revokedAt: null,
          lastAuthorizedAt: LAST_AUTHORIZED_AT,
          consentId: null,
        },
        refreshToken: {},
      }),
    ).toBe(false);
  });

  it('honours tokens of a grant backfilled without a consent', () => {
    expect(
      isRefreshTokenCoveredByAuthorization({
        authorization: {
          revokedAt: null,
          lastAuthorizedAt: null,
          consentId: null,
        },
        refreshToken: {},
      }),
    ).toBe(true);
  });
});
