export const NAVIGATION_DRAWER_TABS = {
  NAVIGATION_MENU: 'home',
  INBOX_HISTORY: 'chat',
  SETTINGS: 'settings',
} as const;

export type NavigationDrawerActiveTab =
  (typeof NAVIGATION_DRAWER_TABS)[keyof typeof NAVIGATION_DRAWER_TABS];
