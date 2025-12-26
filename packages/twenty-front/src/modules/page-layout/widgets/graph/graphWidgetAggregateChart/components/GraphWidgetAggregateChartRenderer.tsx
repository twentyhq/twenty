import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { useGraphWidgetAggregateQuery } from '@/page-layout/widgets/graph/hooks/useGraphWidgetAggregateQuery';
import { assertAggregateChartWidgetOrThrow } from '@/page-layout/widgets/graph/utils/assertAggregateChartWidget';
import { lazy, Suspense } from 'react';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';

const GraphWidgetAggregateChart = lazy(() =>
  import(
    '@/page-layout/widgets/graph/graphWidgetAggregateChart/components/GraphWidgetAggregateChart'
  ).then((module) => ({
    default: module.GraphWidgetAggregateChart,
  })),
);

export const GraphWidgetAggregateChartRenderer = () => {
  const widget = useCurrentWidget();

  assertAggregateChartWidgetOrThrow(widget);

  const { value, loading } = useGraphWidgetAggregateQuery({
    objectMetadataItemId: widget.objectMetadataId,
    configuration: widget.configuration,
  });

  if (loading) {
    return <ChartSkeletonLoader />;
  }

  return (
    <Suspense fallback={<ChartSkeletonLoader />}>
      <GraphWidgetAggregateChart
        value={value ?? '-'}
        prefix={widget.configuration.prefix ?? undefined}
        suffix={widget.configuration.suffix ?? undefined}
      />
    </Suspense>
  );
};
