import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isVerticalListPosition } from '@/page-layout/utils/isVerticalListPosition';
import { isDefined } from 'twenty-shared/utils';

export const sortWidgetsByVerticalListPosition = (
  widgets: PageLayoutWidget[],
): PageLayoutWidget[] =>
  [...widgets].sort((widgetA, widgetB) => {
    const indexA =
      isDefined(widgetA.position) && isVerticalListPosition(widgetA.position)
        ? widgetA.position.index
        : 0;
    const indexB =
      isDefined(widgetB.position) && isVerticalListPosition(widgetB.position)
        ? widgetB.position.index
        : 0;
    return indexA - indexB;
  });
