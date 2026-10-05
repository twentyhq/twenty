import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isViewportFillingWidget } from '@/page-layout/widgets/utils/isViewportFillingWidget';

export const sortWidgetsWithViewportFillingLast = (
  widgets: PageLayoutWidget[],
): PageLayoutWidget[] => [
  ...widgets.filter((widget) => !isViewportFillingWidget(widget)),
  ...widgets.filter(isViewportFillingWidget),
];
