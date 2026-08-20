import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { sortWidgetsWithViewportLast } from '@/page-layout/utils/sortWidgetsWithViewportLast';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const reindexWidgetsToVerticalListPositions = (
  widgets: PageLayoutWidget[],
): PageLayoutWidget[] =>
  sortWidgetsWithViewportLast(widgets).map((widget, index) => ({
    ...widget,
    position: {
      __typename: 'PageLayoutWidgetVerticalListPosition' as const,
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index,
    },
  }));
