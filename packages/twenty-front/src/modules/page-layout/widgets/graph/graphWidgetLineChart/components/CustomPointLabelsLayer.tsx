import { GraphDataLabel } from '@/page-layout/widgets/graph/components/GraphDataLabel';
import { computeLineChartGroupedLabels } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/computeLineChartGroupedLabels';
import { computeLineChartStackedLabels } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/computeLineChartStackedLabels';
import { type LineCustomSvgLayerProps, type LineSeries } from '@nivo/line';

type CustomPointLabelsLayerProps = Pick<
  LineCustomSvgLayerProps<LineSeries>,
  'points'
> & {
  formatValue?: (value: number) => string;
  offset?: number;
  groupMode?: 'stacked';
  omitNullValues?: boolean;
  enablePointLabel: boolean;
};

export const CustomPointLabelsLayer = ({
  points,
  formatValue,
  offset = 0,
  groupMode,
  omitNullValues = false,
  enablePointLabel,
}: CustomPointLabelsLayerProps) => {
  if (!enablePointLabel) {
    return null;
  }

  const lineChartLabels =
    groupMode === 'stacked'
      ? computeLineChartStackedLabels(points)
      : computeLineChartGroupedLabels(points);

  const lineChartLabelsToRender = omitNullValues
    ? lineChartLabels.filter((label) => label.value !== 0)
    : lineChartLabels;

  return (
    <>
      {lineChartLabelsToRender.map((lineChartLabel) => (
        <GraphDataLabel
          key={lineChartLabel.key}
          label={lineChartLabel}
          formatValue={formatValue}
          offset={offset}
          isVerticalLayout={true}
        />
      ))}
    </>
  );
};
