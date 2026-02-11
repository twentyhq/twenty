export const NAVIGATION_MENU_ITEM_TYPE = {
  FOLDER: 'folder',
  LINK: 'link',
  OBJECT: 'object',
  RECORD: 'record',
  VIEW: 'view',
} as const;

export type NavigationMenuItemType =
  (typeof NAVIGATION_MENU_ITEM_TYPE)[keyof typeof NAVIGATION_MENU_ITEM_TYPE];
