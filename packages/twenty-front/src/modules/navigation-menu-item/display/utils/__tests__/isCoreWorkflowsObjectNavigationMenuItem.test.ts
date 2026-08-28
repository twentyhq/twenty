import { NavigationMenuItemType } from 'twenty-shared/types';

import { isCoreWorkflowsObjectNavigationMenuItem } from '@/navigation-menu-item/display/utils/isCoreWorkflowsObjectNavigationMenuItem';

describe('isCoreWorkflowsObjectNavigationMenuItem', () => {
  it('should match an OBJECT item on the workflow object when the flag is on', () => {
    expect(
      isCoreWorkflowsObjectNavigationMenuItem({
        navigationMenuItemType: NavigationMenuItemType.OBJECT,
        objectNameSingular: 'workflow',
        isWorkflowCoreIndexPageEnabled: true,
      }),
    ).toBe(true);
  });

  it('should not match when the flag is off', () => {
    expect(
      isCoreWorkflowsObjectNavigationMenuItem({
        navigationMenuItemType: NavigationMenuItemType.OBJECT,
        objectNameSingular: 'workflow',
        isWorkflowCoreIndexPageEnabled: false,
      }),
    ).toBe(false);
  });

  it('should not match VIEW items on the workflow object', () => {
    expect(
      isCoreWorkflowsObjectNavigationMenuItem({
        navigationMenuItemType: NavigationMenuItemType.VIEW,
        objectNameSingular: 'workflow',
        isWorkflowCoreIndexPageEnabled: true,
      }),
    ).toBe(false);
  });

  it('should not match OBJECT items on other objects', () => {
    expect(
      isCoreWorkflowsObjectNavigationMenuItem({
        navigationMenuItemType: NavigationMenuItemType.OBJECT,
        objectNameSingular: 'company',
        isWorkflowCoreIndexPageEnabled: true,
      }),
    ).toBe(false);
  });

  it('should not match when the item type is unknown', () => {
    expect(
      isCoreWorkflowsObjectNavigationMenuItem({
        objectNameSingular: 'workflow',
        isWorkflowCoreIndexPageEnabled: true,
      }),
    ).toBe(false);
  });
});
