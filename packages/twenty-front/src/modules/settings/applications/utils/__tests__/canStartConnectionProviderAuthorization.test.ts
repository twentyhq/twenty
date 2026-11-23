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

  it.each(['custom', 'oauth-discovery'])(
    'always allows a %s provider',
    (type) => {
      expect(
        canStartConnectionProviderAuthorization({ type, oauth: null }),
      ).toBe(true);
    },
  );
});
