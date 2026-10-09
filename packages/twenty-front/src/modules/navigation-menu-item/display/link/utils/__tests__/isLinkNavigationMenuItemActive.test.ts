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

  it('stays active when the page adds other query params', () => {
    expect(
      isLinkNavigationMenuItemActive({
        computedLink: '/objects/companies?viewId=1',
        location: {
          pathname: '/objects/companies',
          search: '?viewId=1&panel=%2Fobject%2Fcompany%2F2',
        },
      }),
    ).toBe(true);
  });

  it('matches a query whether or not it is percent-encoded', () => {
    expect(
      isLinkNavigationMenuItemActive({
        computedLink: '/objects/companies?filter=Acme Corp',
        location: {
          pathname: '/objects/companies',
          search: '?filter=Acme Corp',
        },
      }),
    ).toBe(true);
    expect(
      isLinkNavigationMenuItemActive({
        computedLink: '/objects/companies?filter=Acme Corp',
        location: {
          pathname: '/objects/companies',
          search: '?filter=Acme%20Corp',
        },
      }),
    ).toBe(true);
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
    expect(
      isLinkNavigationMenuItemActive({
        computedLink: '#section',
        location: { pathname: '/', search: '' },
      }),
    ).toBe(false);
  });
});
