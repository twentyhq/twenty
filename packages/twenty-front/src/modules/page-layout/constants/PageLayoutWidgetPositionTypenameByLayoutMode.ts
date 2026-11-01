import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetPosition,
} from '~/generated-metadata/graphql';

export const PAGE_LAYOUT_WIDGET_POSITION_TYPENAME_BY_LAYOUT_MODE = {
  [PageLayoutTabLayoutMode.GRID]: 'PageLayoutWidgetGridPosition',
  [PageLayoutTabLayoutMode.VERTICAL_LIST]:
    'PageLayoutWidgetVerticalListPosition',
  [PageLayoutTabLayoutMode.CANVAS]: 'PageLayoutWidgetCanvasPosition',
} as const satisfies Record<
  PageLayoutTabLayoutMode,
  NonNullable<PageLayoutWidgetPosition['__typename']>
>;
