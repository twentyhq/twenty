import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { GraphWidgetBarChart } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/GraphWidgetBarChart';
import { useGraphBarChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useGraphBarChartWidgetData';
import { isDefined } from 'twenty-shared/utils';
import {
  type BarChartConfiguration,
  type PageLayoutWidget,
} from '~/generated/graphql';

export const GraphWidgetBarChartRenderer = ({
  widget,
}: {
  widget: PageLayoutWidget;
}) => {
  const { data, indexBy, keys, series, loading, error } =
    useGraphBarChartWidgetData({
      objectMetadataItemId: widget.objectMetadataId,
      configuration: widget.configuration as BarChartConfiguration,
    });

  if (loading) {
    return <ChartSkeletonLoader />;
  }

  if (isDefined(error)) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <GraphWidgetBarChart
      data={data}
      series={series}
      indexBy={indexBy}
      keys={keys}
      id={widget.id}
    />
  );
};
