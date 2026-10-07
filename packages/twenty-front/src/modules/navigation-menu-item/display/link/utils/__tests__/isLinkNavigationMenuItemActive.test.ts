import { isLinkNavigationMenuItemActive } from '@/navigation-menu-item/display/link/utils/isLinkNavigationMenuItemActive';

describe('isLinkNavigationMenuItemActive', () => {
  it('is active on the page an internal link points to', () => {
    expect(
      isLinkNavigationMenuItemActive({
        computedLink: '/workflows',
        location: { pathname: '/workflows', search: '' },
      }),
    ).toBe(true);
  });

  it('matches the query of a link that has one', () => {
    expect(
      isLinkNavigationMenuItemActive({
        computedLink: '/objects/companies?viewId=1',
        location: { pathname: '/objects/companies', search: '?viewId=1' },
      }),
    ).toBe(true);
    expect(
      isLinkNavigationMenuItemActive({
        computedLink: '/objects/companies?viewId=1',
        location: { pathname: '/objects/companies', search: '?viewId=2' },
      }),
    ).toBe(false);
  });

  it('is never active for another page or an external link', () => {
    expect(
      isLinkNavigationMenuItemActive({
        computedLink: '/workflows',
        location: { pathname: '/objects/companies', search: '' },
      }),
    ).toBe(false);
    expect(
      isLinkNavigationMenuItemActive({
        computedLink: 'https://twenty.com',
        location: { pathname: '/', search: '' },
      }),
    ).toBe(false);
  });
});
