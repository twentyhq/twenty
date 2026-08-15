import { getMobileHomeActiveTab } from '@/navigation/utils/getMobileHomeActiveTab';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';

describe('getMobileHomeActiveTab', () => {
  it('should keep the chat tab when the AI permission is granted', () => {
    expect(
      getMobileHomeActiveTab({
        navigationDrawerActiveTab: NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
        hasAiPermission: true,
      }),
    ).toBe(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY);
  });

  it('should fall back to the navigation menu when the AI permission is missing', () => {
    expect(
      getMobileHomeActiveTab({
        navigationDrawerActiveTab: NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
        hasAiPermission: false,
      }),
    ).toBe(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
  });

  it.each([
    NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
    NAVIGATION_DRAWER_TABS.SETTINGS,
  ])('should leave the %s tab alone without the AI permission', (tab) => {
    expect(
      getMobileHomeActiveTab({
        navigationDrawerActiveTab: tab,
        hasAiPermission: false,
      }),
    ).toBe(tab);
  });
});
