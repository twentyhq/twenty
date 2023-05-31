import { getLogoUrlFromDomainName } from '../utils';

describe('getLogoUrlFromDomainName', () => {
  it(`should generate logo url if undefined `, () => {
    expect(getLogoUrlFromDomainName(undefined)).toBe(
      'https://api.faviconkit.com/undefined/144',
    );
  });

  it(`should generate logo url if defined `, () => {
    expect(getLogoUrlFromDomainName('test.com')).toBe(
      'https://api.faviconkit.com/test.com/144',
    );
  });

  it(`should generate logo url if empty `, () => {
    expect(getLogoUrlFromDomainName('')).toBe(
      'https://api.faviconkit.com//144',
    );
  });
});
