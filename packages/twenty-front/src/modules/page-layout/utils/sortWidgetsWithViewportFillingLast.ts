import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetVerticalListSizing } from '@/page-layout/widgets/utils/getWidgetVerticalListSizing';

export const sortWidgetsWithViewportFillingLast = (
  widgets: PageLayoutWidget[],
): PageLayoutWidget[] => [
  ...widgets.filter(
    (widget) => getWidgetVerticalListSizing(widget.type) === 'FIT_CONTENT',
  ),
  ...widgets.filter(
    (widget) => getWidgetVerticalListSizing(widget.type) === 'FILL_VIEWPORT',
  ),
];
