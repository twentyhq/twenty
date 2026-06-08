import { PageLayoutWidgetErrorDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetErrorDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { useGraphWidgetAggregateQuery } from '@/page-layout/widgets/graph/hooks/useGraphWidgetAggregateQuery';
import { assertAggregateChartWidgetOrThrow } from '@/page-layout/widgets/graph/utils/assertAggregateChartWidget';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { lazy, Suspense } from 'react';
import { isDefined } from 'twenty-shared/utils';

const GraphWidgetAggregateChart = lazy(() =>
  import('@/page-layout/widgets/graph/graph-widget-aggregate-chart/components/GraphWidgetAggregateChart').then(
    (module) => ({
      default: module.GraphWidgetAggregateChart,
    }),
  ),
);

export const GraphWidgetAggregateChartRenderer = () => {
  const widget = useCurrentWidget();

  assertAggregateChartWidgetOrThrow(widget);

  const { value, loading, error } = useGraphWidgetAggregateQuery({
    objectMetadataItemId: widget.objectMetadataId,
    configuration: widget.configuration,
  });

  if (loading) {
    return <WidgetSkeletonLoader />;
  }

  if (isDefined(error)) {
    return <PageLayoutWidgetErrorDisplay widgetId={widget.id} />;
  }

  return (
    <Suspense fallback={<WidgetSkeletonLoader />}>
      <GraphWidgetAggregateChart
        value={value ?? '-'}
        prefix={widget.configuration.prefix ?? undefined}
        suffix={widget.configuration.suffix ?? undefined}
      />
    </Suspense>
  );
};
