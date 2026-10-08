import { isConfidentialApplicationOAuthClient } from 'src/engine/core-modules/application/application-oauth/utils/is-confidential-application-oauth-client.util';

describe('isConfidentialApplicationOAuthClient', () => {
  it('is confidential when a secret hash is registered', () => {
    expect(
      isConfidentialApplicationOAuthClient({ oAuthClientSecretHash: 'hashed' }),
    ).toBe(true);
  });

  it('is public when there is no secret hash', () => {
    expect(
      isConfidentialApplicationOAuthClient({ oAuthClientSecretHash: null }),
    ).toBe(false);
  });

  it('is public when the secret hash is an empty string', () => {
    expect(
      isConfidentialApplicationOAuthClient({ oAuthClientSecretHash: '' }),
    ).toBe(false);
  });
});
