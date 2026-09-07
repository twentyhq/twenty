import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isViewportFillingWidgetType } from '@/page-layout/widgets/utils/isViewportFillingWidgetType';

export const shouldShowAddWidgetBelow = (widget: PageLayoutWidget): boolean =>
  !isViewportFillingWidgetType(widget.type);
