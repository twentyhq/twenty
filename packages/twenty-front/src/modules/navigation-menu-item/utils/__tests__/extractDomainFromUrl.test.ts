import { extractDomainFromUrl } from '@/navigation-menu-item/utils/extractDomainFromUrl';

describe('extractDomainFromUrl', () => {
  it('returns hostname and strips www prefix', () => {
    expect(extractDomainFromUrl('https://www.example.com/path')).toBe(
      'example.com',
    );
    expect(extractDomainFromUrl('https://example.com')).toBe('example.com');
  });

  it('returns undefined for invalid URLs', () => {
    expect(extractDomainFromUrl('not-a-url')).toBeUndefined();
    expect(extractDomainFromUrl('')).toBeUndefined();
  });
});
