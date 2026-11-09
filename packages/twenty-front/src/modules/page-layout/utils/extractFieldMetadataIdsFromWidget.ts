import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { getChartReferencedFieldMetadataIds } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

export const extractFieldMetadataIdsFromWidget = ({
  widget,
  dashboardFilterFieldMetadataIds,
}: {
  widget: PageLayoutWidget;
  dashboardFilterFieldMetadataIds: string[];
}): string[] => {
  const chartFieldMetadataIds =
    widget.type === WidgetType.GRAPH &&
    isWidgetConfigurationOfTypeGraph(widget.configuration)
      ? getChartReferencedFieldMetadataIds(widget.configuration)
      : [];

  return [
    ...new Set([...chartFieldMetadataIds, ...dashboardFilterFieldMetadataIds]),
  ];
};
