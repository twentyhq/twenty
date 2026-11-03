import { isNativePageNavigationMenuItemActive } from '@/navigation-menu-item/display/native-page/utils/isNativePageNavigationMenuItemActive';

describe('isNativePageNavigationMenuItemActive', () => {
  it('is active on the workflows index and on a workflow', () => {
    const item = { nativePageKey: 'workflows' };

    expect(
      isNativePageNavigationMenuItemActive({ item, pathname: '/workflows' }),
    ).toBe(true);
    expect(
      isNativePageNavigationMenuItemActive({
        item,
        pathname: '/workflow/0b8a5f2e-7d3c-4b8e-9f1a-2c6d4e8f0a1b',
      }),
    ).toBe(true);
    expect(
      isNativePageNavigationMenuItemActive({ item, pathname: '/agents' }),
    ).toBe(false);
  });

  it('is active on the agents index and on an agent', () => {
    const item = { nativePageKey: 'agents' };

    expect(
      isNativePageNavigationMenuItemActive({ item, pathname: '/agents' }),
    ).toBe(true);
    expect(
      isNativePageNavigationMenuItemActive({
        item,
        pathname: '/agent/2d1c4e8f-6a3b-4c5d-8e9f-0a1b2c3d4e5f',
      }),
    ).toBe(true);
    expect(
      isNativePageNavigationMenuItemActive({ item, pathname: '/workflows' }),
    ).toBe(false);
  });

  it('is never active for an unknown key', () => {
    expect(
      isNativePageNavigationMenuItemActive({
        item: { nativePageKey: 'settings' },
        pathname: '/settings',
      }),
    ).toBe(false);
  });
});
