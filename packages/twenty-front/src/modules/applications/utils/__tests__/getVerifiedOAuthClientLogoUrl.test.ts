import { getVerifiedOAuthClientLogoUrl } from '@/applications/utils/getVerifiedOAuthClientLogoUrl';

describe('getVerifiedOAuthClientLogoUrl', () => {
  it('should return the logo of a verified client', () => {
    expect(
      getVerifiedOAuthClientLogoUrl({ name: 'Twenty CLI', isVerified: true }),
    ).toBe('/images/oauth-clients/twenty-cli.svg');
  });

  it('should return nothing for an unverified client using the name', () => {
    expect(
      getVerifiedOAuthClientLogoUrl({ name: 'Twenty CLI', isVerified: false }),
    ).toBeUndefined();
  });

  it('should return nothing for a verified client without a logo', () => {
    expect(
      getVerifiedOAuthClientLogoUrl({ name: 'toString', isVerified: true }),
    ).toBeUndefined();
  });
});
