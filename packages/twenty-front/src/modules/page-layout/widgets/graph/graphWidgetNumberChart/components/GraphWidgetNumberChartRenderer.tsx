import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { useGraphWidgetAggregateQuery } from '@/page-layout/widgets/graph/hooks/useGraphWidgetAggregateQuery';
import { lazy, Suspense } from 'react';
import {
  type NumberChartConfiguration,
  type PageLayoutWidget,
} from '~/generated/graphql';

const GraphWidgetNumberChart = lazy(() =>
  import(
    '@/page-layout/widgets/graph/graphWidgetNumberChart/components/GraphWidgetNumberChart'
  ).then((module) => ({
    default: module.GraphWidgetNumberChart,
  })),
);

export const GraphWidgetNumberChartRenderer = ({
  widget,
}: {
  widget: PageLayoutWidget;
}) => {
  const { value, loading } = useGraphWidgetAggregateQuery({
    objectMetadataItemId: widget.objectMetadataId,
    configuration: widget.configuration as NumberChartConfiguration,
  });

  if (loading) {
    return <ChartSkeletonLoader />;
  }

  return (
    <Suspense fallback={<ChartSkeletonLoader />}>
      <GraphWidgetNumberChart value={value ?? 0} />
    </Suspense>
  );
};
