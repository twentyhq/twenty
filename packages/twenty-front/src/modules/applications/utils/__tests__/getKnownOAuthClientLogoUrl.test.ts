import { getKnownOAuthClientLogoUrl } from '@/applications/utils/getKnownOAuthClientLogoUrl';

describe('getKnownOAuthClientLogoUrl', () => {
  it('matches the exact redirect host, not its subdomains', () => {
    expect(getKnownOAuthClientLogoUrl('zapier.com')).toBe(
      '/images/oauth-clients/zapier.webp',
    );
    expect(getKnownOAuthClientLogoUrl('hooks.zapier.com')).toBeUndefined();
  });
});
