import { isConfidentialClient } from 'src/engine/core-modules/application/application-oauth/utils/is-confidential-client.util';

describe('isConfidentialClient', () => {
  it('is confidential when a secret hash is registered', () => {
    expect(isConfidentialClient({ oAuthClientSecretHash: 'hashed' })).toBe(
      true,
    );
  });

  it('is public when there is no secret hash', () => {
    expect(isConfidentialClient({ oAuthClientSecretHash: null })).toBe(false);
  });

  it('is public when the secret hash is an empty string', () => {
    expect(isConfidentialClient({ oAuthClientSecretHash: '' })).toBe(false);
  });
});
