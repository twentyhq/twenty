import { getMobileHomeActiveTab } from '@/navigation/utils/getMobileHomeActiveTab';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';

describe('getMobileHomeActiveTab', () => {
  it('should keep the settings tab', () => {
    expect(getMobileHomeActiveTab(NAVIGATION_DRAWER_TABS.SETTINGS)).toBe(
      NAVIGATION_DRAWER_TABS.SETTINGS,
    );
  });

  it('should keep the navigation menu tab', () => {
    expect(getMobileHomeActiveTab(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU)).toBe(
      NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
    );
  });

  // Conversations are a section of the navigation menu on mobile rather than a
  // tab, so the desktop chat tab has no section to map onto.
  it('should fall back to the navigation menu for the chat tab', () => {
    expect(getMobileHomeActiveTab(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY)).toBe(
      NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
    );
  });
});
