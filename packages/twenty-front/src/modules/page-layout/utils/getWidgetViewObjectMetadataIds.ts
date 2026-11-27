import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { type ViewSummary } from '@/views/types/ViewSummary';

export const getWidgetViewObjectMetadataIds = ({
  widgets,
  viewSummaries,
}: {
  widgets: Pick<PageLayoutWidget, 'configuration'>[];
  viewSummaries: Pick<ViewSummary, 'id' | 'objectMetadataId'>[];
}): string[] => {
  const widgetViewIds = new Set(
    widgets.map((widget) => getWidgetConfigurationViewId(widget.configuration)),
  );

  return viewSummaries
    .filter((viewSummary) => widgetViewIds.has(viewSummary.id))
    .map((viewSummary) => viewSummary.objectMetadataId);
};
