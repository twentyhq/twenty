import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isViewportFillingWidgetType } from '@/page-layout/widgets/utils/isViewportFillingWidgetType';

export const sortWidgetsWithViewportFillingLast = (
  widgets: PageLayoutWidget[],
): PageLayoutWidget[] => [
  ...widgets.filter((widget) => !isViewportFillingWidgetType(widget.type)),
  ...widgets.filter((widget) => isViewportFillingWidgetType(widget.type)),
];
