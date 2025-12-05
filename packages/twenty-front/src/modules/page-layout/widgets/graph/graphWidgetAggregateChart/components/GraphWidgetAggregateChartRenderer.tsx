import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { useGraphWidgetAggregateQuery } from '@/page-layout/widgets/graph/hooks/useGraphWidgetAggregateQuery';
import { lazy, Suspense } from 'react';
import {
  type AggregateChartConfiguration,
  type PageLayoutWidget,
} from '~/generated/graphql';

const GraphWidgetAggregateChart = lazy(() =>
  import(
    '@/page-layout/widgets/graph/graphWidgetAggregateChart/components/GraphWidgetAggregateChart'
  ).then((module) => ({
    default: module.GraphWidgetAggregateChart,
  })),
);

export const GraphWidgetAggregateChartRenderer = ({
  widget,
}: {
  widget: PageLayoutWidget;
}) => {
  const configuration = widget.configuration as AggregateChartConfiguration;

  const { value, loading } = useGraphWidgetAggregateQuery({
    objectMetadataItemId: widget.objectMetadataId,
    configuration,
  });

  if (loading) {
    return <ChartSkeletonLoader />;
  }

  return (
    <Suspense fallback={<ChartSkeletonLoader />}>
      <GraphWidgetAggregateChart
        value={value ?? '-'}
        prefix={configuration.prefix ?? undefined}
        suffix={configuration.suffix ?? undefined}
      />
    </Suspense>
  );
};
