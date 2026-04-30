import {
  type PageLayoutWidgetCanvasPosition,
  type PageLayoutWidgetPosition,
  PageLayoutTabLayoutMode,
} from '~/generated-metadata/graphql';

export const isCanvasPosition = (
  position: PageLayoutWidgetPosition,
): position is PageLayoutWidgetCanvasPosition =>
  position.layoutMode === PageLayoutTabLayoutMode.CANVAS;
