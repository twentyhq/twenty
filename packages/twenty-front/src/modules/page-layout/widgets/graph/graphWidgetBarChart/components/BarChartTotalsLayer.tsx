import { GraphDataLabel } from '@/page-layout/widgets/graph/components/GraphDataLabel';
import { type BarChartLabelData } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLabelData';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';
import { computeBarChartGroupedLabels } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartGroupedLabels';
import { computeBarChartStackedLabels } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartStackedLabels';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { type GraphLabelData } from '@/page-layout/widgets/graph/types/GraphLabelData';
import styled from '@emotion/styled';
import { BarChartLayout } from '~/generated-metadata/graphql';

type BarChartTotalsLayerProps = {
  bars: BarPosition[];
  margins: ChartMargins;
  chartWidth: number;
  chartHeight: number;
  formatValue?: (value: number) => string;
  offset?: number;
  layout?: BarChartLayout;
  groupMode?: 'grouped' | 'stacked';
  omitNullValues?: boolean;
  showValues: boolean;
};

const StyledSvgLabels = styled.svg`
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
`;

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

export const BarChartTotalsLayer = ({
  bars,
  margins,
  chartWidth,
  chartHeight,
  formatValue,
  offset = 0,
  layout = BarChartLayout.VERTICAL,
  groupMode = 'grouped',
  omitNullValues = false,
  showValues,
}: BarChartTotalsLayerProps) => {
  if (!showValues || bars.length === 0) {
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
    <StyledSvgLabels width={chartWidth} height={chartHeight}>
      <g transform={`translate(${margins.left}, ${margins.top})`}>
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
      </g>
    </StyledSvgLabels>
  );
};
