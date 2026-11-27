import { isSidebarCustomizationAllowedOnPage } from '@/navigation/utils/isSidebarCustomizationAllowedOnPage';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';

describe('isSidebarCustomizationAllowedOnPage', () => {
  it.each([
    ['/inbox', true],
    ['/inbox/20202020-0000-4000-8000-000000000014', true],
    ['/chat/20202020-0000-4000-8000-000000000014', true],
    ['/settings/profile', false],
    ['/agents', false],
  ])(
    'allows customizing the sidebar on %s when layout customization is blocked there: %s',
    (pathname, expected) => {
      expect(
        isSidebarCustomizationAllowedOnPage({
          pathname,
          activeNavigationDrawerTab: NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
          isLayoutCustomizationAllowedOnCurrentPage: false,
        }),
      ).toBe(expected);
    },
  );

  it('allows customizing the sidebar where layout customization is allowed', () => {
    expect(
      isSidebarCustomizationAllowedOnPage({
        pathname: '/objects/companies',
        activeNavigationDrawerTab: NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
        isLayoutCustomizationAllowedOnCurrentPage: true,
      }),
    ).toBe(true);
  });

  it.each(['/inbox', '/objects/companies'])(
    'does not allow customizing the sidebar on %s while the drawer lists the chat history',
    (pathname) => {
      expect(
        isSidebarCustomizationAllowedOnPage({
          pathname,
          activeNavigationDrawerTab: NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
          isLayoutCustomizationAllowedOnCurrentPage: true,
        }),
      ).toBe(false);
    },
  );
});
