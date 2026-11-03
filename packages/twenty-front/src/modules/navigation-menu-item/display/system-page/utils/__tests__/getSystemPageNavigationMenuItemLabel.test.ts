import { getSystemPageNavigationMenuItemLabel } from '@/navigation-menu-item/display/system-page/utils/getSystemPageNavigationMenuItemLabel';

describe('getSystemPageNavigationMenuItemLabel', () => {
  it('uses the system page name when the item has none', () => {
    expect(
      getSystemPageNavigationMenuItemLabel({
        name: null,
        systemPageKey: 'agents',
      }),
    ).toBe('Agents');
  });

  it('prefers a custom name', () => {
    expect(
      getSystemPageNavigationMenuItemLabel({
        name: 'Automations',
        systemPageKey: 'workflows',
      }),
    ).toBe('Automations');
  });
});
