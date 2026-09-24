import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isVerticalListPosition } from '@/page-layout/utils/isVerticalListPosition';
import { sortWidgetsWithViewportFillingLast } from '@/page-layout/utils/sortWidgetsWithViewportFillingLast';
import { isDefined } from 'twenty-shared/utils';
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
      ...(isDefined(widget.position) &&
      isVerticalListPosition(widget.position) &&
      isDefined(widget.position.heightBehavior)
        ? { heightBehavior: widget.position.heightBehavior }
        : {}),
    },
  }));
