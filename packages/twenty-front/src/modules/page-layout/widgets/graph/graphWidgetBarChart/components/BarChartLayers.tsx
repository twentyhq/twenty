import { AxisLayer } from '@/page-layout/widgets/graph/chart-core/layers/AxisLayer';
import { type AxisLayerConfig } from '@/page-layout/widgets/graph/chart-core/types/AxisLayerConfig';
import { NoDataLayer } from '@/page-layout/widgets/graph/components/NoDataLayer';
import { BarChartBaseLayer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChartBaseLayer';
import { BarChartHoverLayer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChartHoverLayer';
import { BarChartTotalsLayer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChartTotalsLayer';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import styled from '@emotion/styled';
import { BarChartLayout } from '~/generated-metadata/graphql';

const StyledNoDataOverlay = styled.svg`
  height: 100%;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
`;

type BarChartLayersProps = {
  allowDataTransitions: boolean;
  axisBottomTickRotation: number;
  axisConfig: AxisLayerConfig;
  bars: BarPosition[];
  categoryValues: (string | number)[];
  categoryTickValues: (string | number)[];
  chartHeight: number;
  chartWidth: number;
  formatBottomTick: (value: string | number) => string;
  formatLeftTick: (value: string | number) => string;
  formatValue: (value: number) => string;
  groupMode: 'grouped' | 'stacked';
  hasNegativeValues: boolean;
  hasNoData: boolean;
  highlightedLegendId: string | null;
  hoveredSlice: BarChartSlice | null;
  innerHeight: number;
  innerWidth: number;
  labelBars: BarPosition[];
  layout: BarChartLayout;
  margins: ChartMargins;
  omitNullValues: boolean;
  offset: number;
  showGrid: boolean;
  showValues: boolean;
  valueDomain: { min: number; max: number };
  valueTickValues: number[];
  xAxisLabel?: string;
  yAxisLabel?: string;
};

export const BarChartLayers = ({
  allowDataTransitions,
  axisBottomTickRotation,
  axisConfig,
  bars,
  categoryValues,
  categoryTickValues,
  chartHeight,
  chartWidth,
  formatBottomTick,
  formatLeftTick,
  formatValue,
  groupMode,
  hasNegativeValues,
  hasNoData,
  highlightedLegendId,
  hoveredSlice,
  innerHeight,
  innerWidth,
  labelBars,
  layout,
  margins,
  omitNullValues,
  offset,
  showGrid,
  showValues,
  valueDomain,
  valueTickValues,
  xAxisLabel,
  yAxisLabel,
}: BarChartLayersProps) => {
  return (
    <>
      <BarChartHoverLayer
        hoveredSlice={hoveredSlice}
        chartHeight={chartHeight}
        chartWidth={chartWidth}
        layout={layout}
        margins={margins}
      />
      <BarChartBaseLayer
        bars={bars}
        highlightedLegendId={highlightedLegendId}
        showGrid={showGrid}
        valueDomain={valueDomain}
        valueTickValues={valueTickValues}
        allowDataTransitions={allowDataTransitions}
        chartHeight={chartHeight}
        chartWidth={chartWidth}
        layout={layout}
        margins={margins}
      />
      <AxisLayer
        bottomAxisTickRotation={axisBottomTickRotation}
        categoryValues={categoryValues}
        categoryTickValues={categoryTickValues}
        chartHeight={chartHeight}
        chartWidth={chartWidth}
        formatBottomTick={formatBottomTick}
        formatLeftTick={formatLeftTick}
        hasNegativeValues={hasNegativeValues}
        isVertical={layout === BarChartLayout.VERTICAL}
        margins={margins}
        axisConfig={axisConfig}
        valueDomain={valueDomain}
        valueTickValues={valueTickValues}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
      />
      <BarChartTotalsLayer
        bars={labelBars}
        chartHeight={chartHeight}
        chartWidth={chartWidth}
        formatValue={formatValue}
        groupMode={groupMode}
        layout={layout}
        margins={margins}
        offset={offset}
        omitNullValues={omitNullValues}
        showValues={showValues}
      />
      {hasNoData && (
        <StyledNoDataOverlay>
          <g transform={`translate(${margins.left}, ${margins.top})`}>
            <NoDataLayer
              hasNoData={hasNoData}
              innerHeight={innerHeight}
              innerWidth={innerWidth}
            />
          </g>
        </StyledNoDataOverlay>
      )}
    </>
  );
};
