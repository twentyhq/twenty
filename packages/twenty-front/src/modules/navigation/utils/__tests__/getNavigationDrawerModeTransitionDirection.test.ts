import { getNavigationDrawerModeTransitionDirection } from '@/navigation/utils/getNavigationDrawerModeTransitionDirection';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';

const orderedNavigationDrawerModes = [
  NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
  NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
  NAVIGATION_DRAWER_TABS.SETTINGS,
];

describe('getNavigationDrawerModeTransitionDirection', () => {
  it('slides forward when the next mode comes later in the switcher', () => {
    expect(
      getNavigationDrawerModeTransitionDirection({
        orderedNavigationDrawerModes,
        previousNavigationDrawerMode: NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
        nextNavigationDrawerMode: NAVIGATION_DRAWER_TABS.SETTINGS,
      }),
    ).toBe(1);
  });

  it('slides backward when the next mode comes earlier in the switcher', () => {
    expect(
      getNavigationDrawerModeTransitionDirection({
        orderedNavigationDrawerModes,
        previousNavigationDrawerMode: NAVIGATION_DRAWER_TABS.SETTINGS,
        nextNavigationDrawerMode: NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
      }),
    ).toBe(-1);
  });
});
