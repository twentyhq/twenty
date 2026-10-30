import { canStartConnectionProviderAuthorization } from '@/settings/applications/utils/canStartConnectionProviderAuthorization';

describe('canStartConnectionProviderAuthorization', () => {
  it('allows an OAuth provider only once its client credentials are configured', () => {
    expect(
      canStartConnectionProviderAuthorization({
        type: 'oauth',
        oauth: { isClientCredentialsConfigured: true },
      }),
    ).toBe(true);
    expect(
      canStartConnectionProviderAuthorization({
        type: 'oauth',
        oauth: { isClientCredentialsConfigured: false },
      }),
    ).toBe(false);
    expect(
      canStartConnectionProviderAuthorization({ type: 'oauth', oauth: null }),
    ).toBe(false);
  });

  it('always allows a custom provider', () => {
    expect(
      canStartConnectionProviderAuthorization({ type: 'custom', oauth: null }),
    ).toBe(true);
  });
});
