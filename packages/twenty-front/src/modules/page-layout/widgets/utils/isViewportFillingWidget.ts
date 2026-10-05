import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isVerticalListPosition } from '@/page-layout/utils/isVerticalListPosition';
import {
  getPageLayoutWidgetHeightBehavior,
  isDefined,
} from 'twenty-shared/utils';
import { PageLayoutWidgetVerticalListHeightBehavior } from '~/generated-metadata/graphql';

type ViewportFillingWidget = Pick<PageLayoutWidget, 'position' | 'type'>;

export const isViewportFillingWidget = (
  widget: ViewportFillingWidget,
): boolean => {
  return (
    getPageLayoutWidgetHeightBehavior({
      widgetType: widget.type,
      heightBehavior:
        isDefined(widget.position) && isVerticalListPosition(widget.position)
          ? widget.position.heightBehavior
          : undefined,
    }) === PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT
  );
};
