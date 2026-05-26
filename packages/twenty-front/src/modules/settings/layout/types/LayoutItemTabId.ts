export const LAYOUT_ITEM_TAB_IDS = [
  'commands',
  'sidebar',
  'views',
  'pages',
  'front-components',
] as const;

export type LayoutItemTabId = (typeof LAYOUT_ITEM_TAB_IDS)[number];
