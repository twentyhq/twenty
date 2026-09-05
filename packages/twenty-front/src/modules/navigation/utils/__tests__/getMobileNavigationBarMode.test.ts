import { getMobileNavigationBarMode } from '@/navigation/utils/getMobileNavigationBarMode';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';

describe('getMobileNavigationBarMode', () => {
  it('is the settings mode while the settings drawer is open', () => {
    expect(
      getMobileNavigationBarMode({
        isSettingsDrawer: true,
        pathname: '/objects/people',
      }),
    ).toBe(NAVIGATION_DRAWER_TABS.SETTINGS);
  });

  it('is the AI mode on the chat page', () => {
    expect(
      getMobileNavigationBarMode({
        isSettingsDrawer: false,
        pathname: '/chat/20202020-0687-4c41-b707-ed1bfca972a7',
      }),
    ).toBe(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY);
  });

  it('is the navigation menu mode anywhere else', () => {
    expect(
      getMobileNavigationBarMode({
        isSettingsDrawer: false,
        pathname: '/objects/people',
      }),
    ).toBe(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
  });
});
