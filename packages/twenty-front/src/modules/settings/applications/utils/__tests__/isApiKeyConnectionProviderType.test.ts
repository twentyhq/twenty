import { isApiKeyConnectionProviderType } from '@/settings/applications/utils/isApiKeyConnectionProviderType';

describe('isApiKeyConnectionProviderType', () => {
  it('is true only for api-key providers', () => {
    expect(isApiKeyConnectionProviderType('api-key')).toBe(true);
    expect(isApiKeyConnectionProviderType('oauth')).toBe(false);
    expect(isApiKeyConnectionProviderType('oauth-discovery')).toBe(false);
    expect(isApiKeyConnectionProviderType('custom')).toBe(false);
  });
});
