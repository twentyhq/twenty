import { GraphDataLabel } from '@/page-layout/widgets/graph/components/GraphDataLabel';
import { computeLineChartGroupedLabels } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/computeLineChartGroupedLabels';
import { computeLineChartStackedLabels } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/computeLineChartStackedLabels';
import { type LineCustomSvgLayerProps, type LineSeries } from '@nivo/line';

type CustomPointLabelsLayerProps = Pick<
  LineCustomSvgLayerProps<LineSeries>,
  'points' | 'yScale'
> & {
  formatValue?: (value: number) => string;
  offset?: number;
  groupMode?: 'stacked';
  omitNullValues?: boolean;
};

export const CustomPointLabelsLayer = ({
  points,
  yScale,
  formatValue,
  offset = 0,
  groupMode,
  omitNullValues = false,
}: CustomPointLabelsLayerProps) => {
  const labels =
    groupMode === 'stacked'
      ? computeLineChartStackedLabels(points, yScale)
      : computeLineChartGroupedLabels(points);

  const labelsToRender = labels.filter((label) =>
    omitNullValues ? label.value !== 0 : true,
  );

  return (
    <>
      {labelsToRender.map((label) => (
        <GraphDataLabel
          key={label.key}
          label={label}
          formatValue={formatValue}
          offset={offset}
          isVerticalLayout={true}
        />
      ))}
    </>
  );
};
