import { PageLayoutWidgetErrorDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetErrorDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { useGraphWidgetAggregateQuery } from '@/page-layout/widgets/graph/hooks/useGraphWidgetAggregateQuery';
import { assertAggregateChartWidgetOrThrow } from '@/page-layout/widgets/graph/utils/assertAggregateChartWidget';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { lazy, Suspense } from 'react';
import { isDefined } from 'twenty-shared/utils';

const GraphWidgetAggregateChart = lazy(() =>
  import('@/page-layout/widgets/graph/graph-widget-aggregate-chart/components/GraphWidgetAggregateChart').then(
    (module) => ({
      default: module.GraphWidgetAggregateChart,
    }),
  ),
);

type GraphWidgetAggregateChartRendererProps = {
  widget: PageLayoutWidget;
};

export const GraphWidgetAggregateChartRenderer = ({
  widget,
}: GraphWidgetAggregateChartRendererProps) => {
  assertAggregateChartWidgetOrThrow(widget);

  const { value, loading, error } = useGraphWidgetAggregateQuery({
    objectMetadataItemId: widget.objectMetadataId,
    configuration: widget.configuration,
  });

  if (loading) {
    return <WidgetSkeletonLoader />;
  }

  if (isDefined(error)) {
    return <PageLayoutWidgetErrorDisplay widgetId={widget.id} error={error} />;
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
