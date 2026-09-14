import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isViewportFillingWidget } from '@/page-layout/widgets/utils/isViewportFillingWidget';

export const shouldShowAddWidgetBelow = (widget: PageLayoutWidget): boolean =>
  !isViewportFillingWidget(widget);
