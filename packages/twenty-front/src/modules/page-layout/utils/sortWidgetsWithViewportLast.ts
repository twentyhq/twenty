import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetLayoutBehavior } from '@/page-layout/widgets/utils/getWidgetLayoutBehavior';

export const sortWidgetsWithViewportLast = (
  widgets: PageLayoutWidget[],
): PageLayoutWidget[] => [
  ...widgets.filter(
    (widget) => getWidgetLayoutBehavior(widget.type) === 'EXPANDABLE',
  ),
  ...widgets.filter(
    (widget) => getWidgetLayoutBehavior(widget.type) === 'TAB_VIEWPORT',
  ),
];
