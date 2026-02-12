import { normalizeUrl } from '@/navigation-menu-item/utils/normalizeUrl';

describe('normalizeUrl', () => {
  it('should leave url unchanged when it has protocol, otherwise prepend https', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    expect(normalizeUrl('example.com')).toBe('https://example.com');
    expect(normalizeUrl('  example.com  ')).toBe('https://example.com');
  });

  it('should return empty string for empty or whitespace input', () => {
    expect(normalizeUrl('')).toBe('');
    expect(normalizeUrl('   ')).toBe('');
  });
});
