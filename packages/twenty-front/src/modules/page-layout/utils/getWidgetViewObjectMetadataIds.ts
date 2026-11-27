import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { type View } from '@/views/types/View';

export const getWidgetViewObjectMetadataIds = ({
  widgets,
  views,
}: {
  widgets: Pick<PageLayoutWidget, 'configuration'>[];
  views: Pick<View, 'id' | 'objectMetadataId'>[];
}): string[] => {
  const widgetViewIds = new Set(
    widgets.map((widget) => getWidgetConfigurationViewId(widget.configuration)),
  );

  return views
    .filter((view) => widgetViewIds.has(view.id))
    .map((view) => view.objectMetadataId);
};
