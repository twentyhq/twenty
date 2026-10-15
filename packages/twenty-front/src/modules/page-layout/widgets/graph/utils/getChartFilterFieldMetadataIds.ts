import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type ChartFilters } from '@/side-panel/pages/page-layout/types/ChartFilters';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';

export const getChartFilterFieldMetadataIds = (
  configuration: PageLayoutWidget['configuration'],
): string[] => {
  if (!isWidgetConfigurationOfTypeGraph(configuration)) {
    return [];
  }

  // filter is an untyped JSON scalar in the GraphQL schema
  const chartFilters: ChartFilters | null | undefined = configuration.filter;

  return (chartFilters?.recordFilters ?? []).map(
    (recordFilter) => recordFilter.fieldMetadataId,
  );
};
