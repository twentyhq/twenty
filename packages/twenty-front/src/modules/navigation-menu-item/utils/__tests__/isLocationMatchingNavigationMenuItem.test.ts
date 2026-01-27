import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/utils/isLocationMatchingNavigationMenuItem';

describe('isLocationMatchingNavigationMenuItem', () => {
  it('should return true if navigation menu item link matches current path for non-view items', () => {
    const currentPath = '/app/objects/people';
    const currentViewPath = '/app/objects/people?viewId=123';
    const navigationMenuItem = {
      objectNameSingular: 'person',
      link: '/app/objects/people',
    };

    expect(
      isLocationMatchingNavigationMenuItem(
        currentPath,
        currentViewPath,
        navigationMenuItem,
      ),
    ).toBe(true);
  });

  it('should return true if navigation menu item link matches current view path for view items', () => {
    const currentPath = '/app/objects/companies';
    const currentViewPath = '/app/objects/companies?viewId=123';
    const navigationMenuItem = {
      objectNameSingular: 'view',
      link: '/app/objects/companies?viewId=123',
    };

    expect(
      isLocationMatchingNavigationMenuItem(
        currentPath,
        currentViewPath,
        navigationMenuItem,
      ),
    ).toBe(true);
  });

  it('should return false if navigation menu item link does not match current path for non-view items', () => {
    const currentPath = '/app/objects/people';
    const currentViewPath = '/app/objects/people?viewId=123';
    const navigationMenuItem = {
      objectNameSingular: 'person',
      link: '/app/objects/company',
    };

    expect(
      isLocationMatchingNavigationMenuItem(
        currentPath,
        currentViewPath,
        navigationMenuItem,
      ),
    ).toBe(false);
  });

  it('should return false if navigation menu item link does not match current view path for view items', () => {
    const currentPath = '/app/objects/companies';
    const currentViewPath = '/app/objects/companies?viewId=123';
    const navigationMenuItem = {
      objectNameSingular: 'view',
      link: '/app/objects/companies?viewId=456',
    };

    expect(
      isLocationMatchingNavigationMenuItem(
        currentPath,
        currentViewPath,
        navigationMenuItem,
      ),
    ).toBe(false);
  });

  it('should use current path for non-view items even if view path is different', () => {
    const currentPath = '/app/objects/people';
    const currentViewPath = '/app/objects/people?viewId=999';
    const navigationMenuItem = {
      objectNameSingular: 'person',
      link: '/app/objects/people',
    };

    expect(
      isLocationMatchingNavigationMenuItem(
        currentPath,
        currentViewPath,
        navigationMenuItem,
      ),
    ).toBe(true);
  });
});
