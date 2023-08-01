import { getLogoUrlFromDomainName, sanitizeURL } from '..';

describe('sanitizeURL', () => {
  test('should sanitize the URL correctly', () => {
    expect(sanitizeURL('http://example.com/')).toBe('example.com');
    expect(sanitizeURL('https://www.example.com/')).toBe('example.com');
    expect(sanitizeURL('www.example.com')).toBe('example.com');
    expect(sanitizeURL('example.com')).toBe('example.com');
    expect(sanitizeURL('example.com/')).toBe('example.com');
  });

  test('should handle undefined input', () => {
    expect(sanitizeURL(undefined)).toBe('');
  });
});

describe('getLogoUrlFromDomainName', () => {
  test('should return the correct logo URL for a given domain', () => {
    const imgMock = {
      complete: true,
      src: '',
      setAttribute(name: string, value: string) {
        this.src = value;
      },
    };
    document.createElement = () => imgMock as unknown as HTMLElement;

    expect(getLogoUrlFromDomainName('example.com')).toBe(
      'https://api.faviconkit.com/example.com/144',
    );

    expect(getLogoUrlFromDomainName('http://example.com/')).toBe(
      'https://api.faviconkit.com/example.com/144',
    );

    expect(getLogoUrlFromDomainName('https://www.example.com/')).toBe(
      'https://api.faviconkit.com/example.com/144',
    );

    expect(getLogoUrlFromDomainName('www.example.com')).toBe(
      'https://api.faviconkit.com/example.com/144',
    );

    expect(getLogoUrlFromDomainName('example.com/')).toBe(
      'https://api.faviconkit.com/example.com/144',
    );

    expect(getLogoUrlFromDomainName('apple.com')).toBe(
      'https://api.faviconkit.com/www.apple.com/144',
    );
  });

  test('should handle undefined input', () => {
    expect(getLogoUrlFromDomainName(undefined)).toBeUndefined();
  });
});
