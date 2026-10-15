import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type ChartFilters } from '@/side-panel/pages/page-layout/types/ChartFilters';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';

export const getChartFilterFieldMetadataIds = (
  configuration: PageLayoutWidget['configuration'],
): string[] => {
  if (!isWidgetConfigurationOfTypeGraph(configuration)) {
    return [];
  }

  const chartFilters = configuration.filter as ChartFilters | null | undefined;

  return (chartFilters?.recordFilters ?? []).map(
    (recordFilter) => recordFilter.fieldMetadataId,
  );
};
