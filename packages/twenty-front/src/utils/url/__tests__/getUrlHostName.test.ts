import { getUrlHostname } from '~/utils/url/getUrlHostname';

describe('getUrlHostname', () => {
  it("returns the URL's hostname", () => {
    expect(getUrlHostname('https://www.example.com')).toBe('example.com');
    expect(getUrlHostname('http://subdomain.example.com')).toBe(
      'subdomain.example.com',
    );
    expect(getUrlHostname('https://www.example.com/path')).toBe('example.com');
    expect(getUrlHostname('https://www.example.com?query=123')).toBe(
      'example.com',
    );
    expect(getUrlHostname('http://localhost:3000')).toBe('localhost');
    expect(getUrlHostname('example.com')).toBe('example.com');
    expect(getUrlHostname('www.subdomain.example.com')).toBe(
      'subdomain.example.com',
    );
  });

  it('returns an empty string for invalid URLs', () => {
    expect(getUrlHostname('?o')).toBe('');
    expect(getUrlHostname('')).toBe('');
    expect(getUrlHostname('\\')).toBe('');
  });
});
