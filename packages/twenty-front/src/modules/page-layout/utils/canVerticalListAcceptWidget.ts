import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isViewportFillingWidgetType } from '@/page-layout/widgets/utils/isViewportFillingWidgetType';

type CanVerticalListAcceptWidgetParams = {
  destinationWidgets: PageLayoutWidget[];
  widget: Pick<PageLayoutWidget, 'id' | 'type'>;
};

export const canVerticalListAcceptWidget = ({
  destinationWidgets,
  widget,
}: CanVerticalListAcceptWidgetParams): boolean =>
  !isViewportFillingWidgetType(widget.type) ||
  !destinationWidgets.some(
    (destinationWidget) =>
      destinationWidget.id !== widget.id &&
      destinationWidget.isActive &&
      isViewportFillingWidgetType(destinationWidget.type),
  );
