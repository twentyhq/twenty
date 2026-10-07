import { getLinkNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/link/utils/getLinkNavigationMenuItemComputedLink';

describe('getLinkNavigationMenuItemComputedLink', () => {
  it('keeps absolute URLs', () => {
    expect(
      getLinkNavigationMenuItemComputedLink({ link: 'https://twenty.com' }),
    ).toBe('https://twenty.com');
  });

  it('prefixes bare domains with https', () => {
    expect(getLinkNavigationMenuItemComputedLink({ link: 'twenty.com' })).toBe(
      'https://twenty.com',
    );
  });

  it('keeps internal app paths', () => {
    expect(getLinkNavigationMenuItemComputedLink({ link: '/workflows' })).toBe(
      '/workflows',
    );
  });

  it('keeps protocol-relative URLs external', () => {
    expect(getLinkNavigationMenuItemComputedLink({ link: '//evil.com' })).toBe(
      'https:////evil.com',
    );
  });

  it('keeps a path with control characters external', () => {
    expect(
      getLinkNavigationMenuItemComputedLink({ link: '/\t/evil.com' }),
    ).toBe('https:///\t/evil.com');
  });

  it('returns an empty string without a link', () => {
    expect(getLinkNavigationMenuItemComputedLink({ link: null })).toBe('');
  });
});
