import {
  type PageLayoutWidgetPosition,
  type PageLayoutWidgetVerticalListPosition,
  PageLayoutTabLayoutMode,
} from '~/generated-metadata/graphql';

export const isVerticalListPosition = (
  position: PageLayoutWidgetPosition,
): position is PageLayoutWidgetVerticalListPosition =>
  position.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST;
