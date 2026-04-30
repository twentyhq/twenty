import {
  type PageLayoutWidgetGridPosition,
  type PageLayoutWidgetPosition,
  PageLayoutTabLayoutMode,
} from '~/generated-metadata/graphql';

export const isGridPosition = (
  position: PageLayoutWidgetPosition,
): position is PageLayoutWidgetGridPosition =>
  position.layoutMode === PageLayoutTabLayoutMode.GRID;
