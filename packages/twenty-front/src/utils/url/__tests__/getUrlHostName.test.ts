import { getUrlHostName } from '~/utils/url/getUrlHostName';

describe('getUrlHostName', () => {
  it("returns the URL's hostname", () => {
    expect(getUrlHostName('https://www.example.com')).toBe('example.com');
    expect(getUrlHostName('http://subdomain.example.com')).toBe(
      'subdomain.example.com',
    );
    expect(getUrlHostName('https://www.example.com/path')).toBe('example.com');
    expect(getUrlHostName('https://www.example.com?query=123')).toBe(
      'example.com',
    );
    expect(getUrlHostName('http://localhost:3000')).toBe('localhost');
    expect(getUrlHostName('example.com')).toBe('example.com');
    expect(getUrlHostName('www.subdomain.example.com')).toBe(
      'subdomain.example.com',
    );
  });

  it('returns an empty string for invalid URLs', () => {
    expect(getUrlHostName('?o')).toBe('');
    expect(getUrlHostName('')).toBe('');
    expect(getUrlHostName('\\')).toBe('');
  });
});
