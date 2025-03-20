import { getUrlHostnameOrThrow } from '@/utils/url/getUrlHostnameOrThrow';

describe('getUrlHostnameOrThrow', () => {
  it("returns the URL's hostname", () => {
    expect(getUrlHostnameOrThrow('https://www.example.com')).toBe(
      'www.example.com',
    );
    expect(getUrlHostnameOrThrow('http://subdomain.example.com')).toBe(
      'subdomain.example.com',
    );
    expect(getUrlHostnameOrThrow('https://www.example.com/path')).toBe(
      'www.example.com',
    );
    expect(getUrlHostnameOrThrow('https://www.example.com?query=123')).toBe(
      'www.example.com',
    );
    expect(getUrlHostnameOrThrow('http://localhost:3000')).toBe('localhost');
    expect(getUrlHostnameOrThrow('example.com')).toBe('example.com');
    expect(getUrlHostnameOrThrow('www.subdomain.example.com')).toBe(
      'www.subdomain.example.com',
    );
  });

  it('returns an empty string for invalid URLs', () => {
    expect(() => getUrlHostnameOrThrow('?o')).toThrow('Invalid URL');
    expect(() => getUrlHostnameOrThrow('')).toThrow('Invalid URL');
    expect(() => getUrlHostnameOrThrow('\\')).toThrow('Invalid URL');
    expect(() => getUrlHostnameOrThrow('2')).toThrow('Invalid URL');
  });
});
