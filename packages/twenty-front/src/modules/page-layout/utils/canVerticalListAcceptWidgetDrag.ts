import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type PageLayoutWidgetDndData } from '@/page-layout/types/PageLayoutWidgetDndData';
import { canVerticalListAcceptWidget } from '@/page-layout/utils/canVerticalListAcceptWidget';
import { type Draggable } from '@dnd-kit/abstract';

type CanVerticalListAcceptWidgetDragParams = {
  destinationWidgets: PageLayoutWidget[];
  source: Draggable;
};

export const canVerticalListAcceptWidgetDrag = ({
  destinationWidgets,
  source,
}: CanVerticalListAcceptWidgetDragParams): boolean => {
  const sourceData = source.data as PageLayoutWidgetDndData | undefined;

  if (sourceData?.type !== 'widget') {
    return false;
  }

  return canVerticalListAcceptWidget({
    destinationWidgets,
    widget: {
      id: sourceData.widgetId,
      type: sourceData.widgetType,
    },
  });
};
