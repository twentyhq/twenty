import { getNavigationDrawerModeTransitionDirection } from '@/navigation/utils/getNavigationDrawerModeTransitionDirection';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';

describe('getNavigationDrawerModeTransitionDirection', () => {
  it('slides in from the right when moving to a later mode', () => {
    expect(
      getNavigationDrawerModeTransitionDirection({
        previousNavigationDrawerMode: NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
        nextNavigationDrawerMode: NAVIGATION_DRAWER_TABS.SETTINGS,
        textDirection: 'ltr',
      }),
    ).toBe(1);
  });

  it('slides in from the left when moving to an earlier mode', () => {
    expect(
      getNavigationDrawerModeTransitionDirection({
        previousNavigationDrawerMode: NAVIGATION_DRAWER_TABS.SETTINGS,
        nextNavigationDrawerMode: NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
        textDirection: 'ltr',
      }),
    ).toBe(-1);
  });

  it('mirrors the slide when the switcher is laid out right to left', () => {
    expect(
      getNavigationDrawerModeTransitionDirection({
        previousNavigationDrawerMode: NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
        nextNavigationDrawerMode: NAVIGATION_DRAWER_TABS.SETTINGS,
        textDirection: 'rtl',
      }),
    ).toBe(-1);
  });
});
