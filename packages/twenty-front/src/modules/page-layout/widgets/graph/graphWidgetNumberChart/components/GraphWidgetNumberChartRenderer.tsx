import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { lazy, Suspense } from 'react';
import { type PageLayoutWidget } from '~/generated/graphql';

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
  return (
    <Suspense fallback={<ChartSkeletonLoader />}>
      <GraphWidgetNumberChart value="0" />
    </Suspense>
  );
};
