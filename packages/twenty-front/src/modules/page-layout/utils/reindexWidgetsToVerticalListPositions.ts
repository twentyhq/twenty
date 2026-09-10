import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { sortWidgetsWithViewportFillingLast } from '@/page-layout/utils/sortWidgetsWithViewportFillingLast';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const reindexWidgetsToVerticalListPositions = (
  widgets: PageLayoutWidget[],
): PageLayoutWidget[] =>
  sortWidgetsWithViewportFillingLast(widgets).map((widget, index) => ({
    ...widget,
    position: {
      __typename: 'PageLayoutWidgetVerticalListPosition' as const,
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index,
    },
  }));
