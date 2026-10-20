import { getPrivacyAudience } from '@/settings/privacy/utils/getPrivacyAudience';

describe('getPrivacyAudience', () => {
  it.each(['FR', 'DE', 'NO', 'CH', 'GB'])(
    'targets visitors from %s with the EU version',
    (countryCode) => {
      expect(getPrivacyAudience(countryCode)).toBe('eu');
    },
  );

  it.each(['US', 'BR', 'IN'])(
    'targets visitors from %s with the global version',
    (countryCode) => {
      expect(getPrivacyAudience(countryCode)).toBe('global');
    },
  );

  it('falls back to the global version when the country is unknown', () => {
    expect(getPrivacyAudience(null)).toBe('global');
    expect(getPrivacyAudience(undefined)).toBe('global');
  });
});
