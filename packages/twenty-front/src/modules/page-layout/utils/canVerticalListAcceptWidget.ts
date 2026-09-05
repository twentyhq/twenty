import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isViewportFillingWidget } from '@/page-layout/widgets/utils/isViewportFillingWidget';

type CanVerticalListAcceptWidgetParams = {
  destinationWidgets: PageLayoutWidget[];
  widget: Pick<PageLayoutWidget, 'id' | 'position' | 'type'>;
};

export const canVerticalListAcceptWidget = ({
  destinationWidgets,
  widget,
}: CanVerticalListAcceptWidgetParams): boolean =>
  !isViewportFillingWidget(widget) ||
  !destinationWidgets.some(
    (destinationWidget) =>
      destinationWidget.id !== widget.id &&
      destinationWidget.isActive &&
      isViewportFillingWidget(destinationWidget),
  );
