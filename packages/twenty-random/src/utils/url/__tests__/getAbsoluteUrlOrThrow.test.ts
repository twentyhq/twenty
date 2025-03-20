import { getAbsoluteUrlOrThrow } from '@/utils/url/getAbsoluteUrlOrThrow';

describe('getAbsoluteUrlOrThrow', () => {
  it("returns the URL's hostname", () => {
    expect(getAbsoluteUrlOrThrow('https://www.example.com')).toBe(
      'https://www.example.com',
    );
  });

  it('returns an empty string for invalid URLs', () => {
    expect(() => getAbsoluteUrlOrThrow('?o')).toThrow('Invalid URL');
    expect(() => getAbsoluteUrlOrThrow('')).toThrow('Invalid URL');
    expect(() => getAbsoluteUrlOrThrow('\\')).toThrow('Invalid URL');
    expect(() => getAbsoluteUrlOrThrow('2')).toThrow('Invalid URL');
  });
});
