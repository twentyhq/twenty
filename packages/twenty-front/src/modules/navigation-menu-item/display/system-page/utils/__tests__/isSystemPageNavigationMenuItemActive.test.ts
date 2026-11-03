import { isSystemPageNavigationMenuItemActive } from '@/navigation-menu-item/display/system-page/utils/isSystemPageNavigationMenuItemActive';

describe('isSystemPageNavigationMenuItemActive', () => {
  it('is active on the workflows index and on a workflow', () => {
    const item = { systemPageKey: 'workflows' };

    expect(
      isSystemPageNavigationMenuItemActive({ item, pathname: '/workflows' }),
    ).toBe(true);
    expect(
      isSystemPageNavigationMenuItemActive({
        item,
        pathname: '/workflow/0b8a5f2e-7d3c-4b8e-9f1a-2c6d4e8f0a1b',
      }),
    ).toBe(true);
    expect(
      isSystemPageNavigationMenuItemActive({ item, pathname: '/agents' }),
    ).toBe(false);
  });

  it('is active anywhere under the data model settings', () => {
    const item = { systemPageKey: 'dataModel' };

    expect(
      isSystemPageNavigationMenuItemActive({
        item,
        pathname: '/settings/objects',
      }),
    ).toBe(true);
    expect(
      isSystemPageNavigationMenuItemActive({
        item,
        pathname: '/settings/objects/people',
      }),
    ).toBe(true);
    expect(
      isSystemPageNavigationMenuItemActive({
        item,
        pathname: '/settings/members',
      }),
    ).toBe(false);
  });

  it('is never active for an unknown key', () => {
    expect(
      isSystemPageNavigationMenuItemActive({
        item: { systemPageKey: 'settings' },
        pathname: '/settings',
      }),
    ).toBe(false);
  });
});
