import { isApplicationAccessTokenAuthorized } from 'src/engine/core-modules/application/application-authorization/utils/is-application-access-token-authorized.util';

const AUTHORIZED_AT = '2026-01-01T00:00:10.500Z';
const AUTHORIZED_AT_SECONDS = Math.floor(
  new Date(AUTHORIZED_AT).getTime() / 1000,
);

describe('isApplicationAccessTokenAuthorized', () => {
  it('should accept a token issued under the active authorization', () => {
    expect(
      isApplicationAccessTokenAuthorized({
        flatApplicationAuthorization: {
          lastAuthorizedAt: AUTHORIZED_AT,
          revokedAt: null,
        },
        token: { iat: AUTHORIZED_AT_SECONDS + 60 },
      }),
    ).toBe(true);
  });

  it('should reject a token once its authorization is revoked', () => {
    expect(
      isApplicationAccessTokenAuthorized({
        flatApplicationAuthorization: {
          lastAuthorizedAt: AUTHORIZED_AT,
          revokedAt: '2026-01-01T00:05:00.000Z',
        },
        token: { iat: AUTHORIZED_AT_SECONDS + 60 },
      }),
    ).toBe(false);
  });

  it('should reject a token issued before the user authorized again', () => {
    expect(
      isApplicationAccessTokenAuthorized({
        flatApplicationAuthorization: {
          lastAuthorizedAt: AUTHORIZED_AT,
          revokedAt: null,
        },
        token: { iat: AUTHORIZED_AT_SECONDS - 60 },
      }),
    ).toBe(false);
  });

  it('should reject a token whose authorization no longer exists', () => {
    expect(
      isApplicationAccessTokenAuthorized({
        flatApplicationAuthorization: null,
        token: { iat: AUTHORIZED_AT_SECONDS },
      }),
    ).toBe(false);
  });
});
