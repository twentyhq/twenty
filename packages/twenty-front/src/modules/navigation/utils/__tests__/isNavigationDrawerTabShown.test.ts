import { isNavigationDrawerTabShown } from '@/navigation/utils/isNavigationDrawerTabShown';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';

const flags = {
  hasAiPermission: true,
  isCustomizableSidebarEnabled: true,
};

describe('isNavigationDrawerTabShown', () => {
  it('should always show Home', () => {
    expect(
      isNavigationDrawerTabShown({
        ...flags,
        hasAiPermission: false,
        tab: NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
      }),
    ).toBe(true);
  });

  it('should show Inbox only with AI access while the customizable sidebar is off', () => {
    expect(
      isNavigationDrawerTabShown({
        ...flags,
        isCustomizableSidebarEnabled: false,
        tab: NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
      }),
    ).toBe(true);
    expect(
      isNavigationDrawerTabShown({
        ...flags,
        isCustomizableSidebarEnabled: false,
        hasAiPermission: false,
        tab: NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
      }),
    ).toBe(false);
  });

  it('should never show Inbox once the customizable sidebar is on', () => {
    expect(
      isNavigationDrawerTabShown({
        ...flags,
        tab: NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
      }),
    ).toBe(false);
  });

  it('should hide Settings once the customizable sidebar is on', () => {
    expect(
      isNavigationDrawerTabShown({
        ...flags,
        tab: NAVIGATION_DRAWER_TABS.SETTINGS,
      }),
    ).toBe(false);
    expect(
      isNavigationDrawerTabShown({
        ...flags,
        isCustomizableSidebarEnabled: false,
        tab: NAVIGATION_DRAWER_TABS.SETTINGS,
      }),
    ).toBe(true);
  });
});
