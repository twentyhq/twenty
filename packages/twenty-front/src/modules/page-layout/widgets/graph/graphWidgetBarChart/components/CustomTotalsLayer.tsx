import { GraphDataLabel } from '@/page-layout/widgets/graph/components/GraphDataLabel';
import { type BarChartLabelData } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLabelData';
import { computeBarChartGroupedLabels } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartGroupedLabels';
import { computeBarChartStackedLabels } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartStackedLabels';
import { type GraphLabelData } from '@/page-layout/widgets/graph/types/GraphLabelData';
import { type BarCustomLayerProps, type BarDatum } from '@nivo/bar';
import { BarChartLayout } from '~/generated/graphql';

type CustomTotalsLayerProps = Pick<BarCustomLayerProps<BarDatum>, 'bars'> & {
  formatValue?: (value: number) => string;
  offset?: number;
  layout?: BarChartLayout;
  groupMode?: 'grouped' | 'stacked';
  omitNullValues?: boolean;
  showValues: boolean;
};

const convertToGraphLabelData = (
  barChartLabel: BarChartLabelData,
  isVerticalLayout: boolean,
): GraphLabelData => {
  return {
    key: barChartLabel.key,
    value: barChartLabel.value,
    x: isVerticalLayout ? barChartLabel.verticalX : barChartLabel.horizontalX,
    y: isVerticalLayout ? barChartLabel.verticalY : barChartLabel.horizontalY,
    shouldRenderBelow: barChartLabel.shouldRenderBelow,
  };
};

export const CustomTotalsLayer = ({
  bars,
  formatValue,
  offset = 0,
  layout = BarChartLayout.VERTICAL,
  groupMode = 'grouped',
  omitNullValues = false,
  showValues,
}: CustomTotalsLayerProps) => {
  if (!showValues) {
    return null;
  }

  const isVerticalLayout = layout === BarChartLayout.VERTICAL;

  const barChartLabels =
    groupMode === 'stacked'
      ? computeBarChartStackedLabels(bars)
      : computeBarChartGroupedLabels(bars);

  const barChartLabelsToRender = omitNullValues
    ? barChartLabels.filter((label) => label.value !== 0)
    : barChartLabels;

  return (
    <>
      {barChartLabelsToRender.map((barChartLabel) => {
        const graphLabel = convertToGraphLabelData(
          barChartLabel,
          isVerticalLayout,
        );

        return (
          <GraphDataLabel
            key={graphLabel.key}
            label={graphLabel}
            formatValue={formatValue}
            offset={offset}
            isVerticalLayout={isVerticalLayout}
          />
        );
      })}
    </>
  );
};
