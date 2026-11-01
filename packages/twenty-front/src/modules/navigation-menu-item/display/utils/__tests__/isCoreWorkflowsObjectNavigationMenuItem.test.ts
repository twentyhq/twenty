import { NavigationMenuItemType } from 'twenty-shared/types';

import { isCoreWorkflowsObjectNavigationMenuItem } from '@/navigation-menu-item/display/utils/isCoreWorkflowsObjectNavigationMenuItem';

describe('isCoreWorkflowsObjectNavigationMenuItem', () => {
  it('should match an OBJECT item on the workflow object', () => {
    expect(
      isCoreWorkflowsObjectNavigationMenuItem({
        navigationMenuItemType: NavigationMenuItemType.OBJECT,
        objectNameSingular: 'workflow',
      }),
    ).toBe(true);
  });

  it('should not match VIEW items on the workflow object', () => {
    expect(
      isCoreWorkflowsObjectNavigationMenuItem({
        navigationMenuItemType: NavigationMenuItemType.VIEW,
        objectNameSingular: 'workflow',
      }),
    ).toBe(false);
  });

  it('should not match OBJECT items on other objects', () => {
    expect(
      isCoreWorkflowsObjectNavigationMenuItem({
        navigationMenuItemType: NavigationMenuItemType.OBJECT,
        objectNameSingular: 'company',
      }),
    ).toBe(false);
  });

  it('should not match when the item type is unknown', () => {
    expect(
      isCoreWorkflowsObjectNavigationMenuItem({
        objectNameSingular: 'workflow',
      }),
    ).toBe(false);
  });
});
