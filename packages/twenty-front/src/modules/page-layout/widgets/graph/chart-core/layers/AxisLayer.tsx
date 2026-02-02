import { AxisLabel } from '@/page-layout/widgets/graph/chart-core/layers/AxisLabel';
import { BottomAxisTicks } from '@/page-layout/widgets/graph/chart-core/layers/BottomAxisTicks';
import { LeftAxisTicks } from '@/page-layout/widgets/graph/chart-core/layers/LeftAxisTicks';
import { ZeroLine } from '@/page-layout/widgets/graph/chart-core/layers/ZeroLine';
import { type AxisLayerConfig } from '@/page-layout/widgets/graph/chart-core/types/AxisLayerConfig';
import { getAxisLayerLayout } from '@/page-layout/widgets/graph/chart-core/utils/getAxisLayerLayout';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

type AxisLayerProps = {
  bottomAxisTickRotation: number;
  categoryValues: (string | number)[];
  categoryTickValues: (string | number)[];
  chartHeight: number;
  chartWidth: number;
  formatBottomTick: (value: string | number) => string;
  formatLeftTick: (value: string | number) => string;
  hasNegativeValues: boolean;
  isVertical: boolean;
  margins: ChartMargins;
  valueDomain: { min: number; max: number };
  valueTickValues: number[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  axisConfig: AxisLayerConfig;
};

const StyledSvgOverlay = styled.svg`
  left: 0;
  overflow: visible;
  pointer-events: none;
  position: absolute;
  top: 0;
`;

const STROKE_ALIGNMENT_OFFSET = 0.5 as const;

export const AxisLayer = ({
  bottomAxisTickRotation,
  categoryValues,
  categoryTickValues,
  chartHeight,
  chartWidth,
  formatBottomTick,
  formatLeftTick,
  hasNegativeValues,
  isVertical,
  margins,
  valueDomain,
  valueTickValues,
  xAxisLabel,
  yAxisLabel,
  axisConfig,
}: AxisLayerProps) => {
  const theme = useTheme();
  const tickFontSize = axisConfig.tickFontSize;
  const legendFontSize = axisConfig.legendFontSize;

  const {
    innerWidth,
    innerHeight,
    bottomTickValues,
    leftTickValues,
    getBottomTickPosition,
    getLeftTickPosition,
    hasRotation,
    bottomLegendOffset,
    leftLegendOffset,
    shouldRenderZeroLine,
    zeroPosition,
  } = getAxisLayerLayout({
    bottomAxisTickRotation,
    categoryValues,
    categoryTickValues,
    chartHeight,
    chartWidth,
    hasNegativeValues,
    isVertical,
    margins,
    valueDomain,
    valueTickValues,
    axisConfig,
  });

  return (
    <StyledSvgOverlay width={chartWidth} height={chartHeight}>
      <g transform={`translate(${margins.left}, ${margins.top})`}>
        <line
          x1={0}
          y1={innerHeight + STROKE_ALIGNMENT_OFFSET}
          x2={innerWidth}
          y2={innerHeight + STROKE_ALIGNMENT_OFFSET}
          stroke={theme.border.color.light}
          strokeWidth={1}
        />

        <line
          x1={0}
          y1={0}
          x2={0}
          y2={innerHeight}
          stroke={theme.border.color.light}
          strokeWidth={1}
        />

        {shouldRenderZeroLine && (
          <ZeroLine
            isVertical={isVertical}
            zeroPosition={zeroPosition}
            innerWidth={innerWidth}
            innerHeight={innerHeight}
          />
        )}

        <g transform={`translate(0, ${innerHeight})`}>
          <BottomAxisTicks
            bottomTickValues={bottomTickValues}
            getBottomTickPosition={getBottomTickPosition}
            formatBottomTick={formatBottomTick}
            hasRotation={hasRotation}
            bottomAxisTickRotation={bottomAxisTickRotation}
            tickPadding={axisConfig.tickPadding}
            tickFontSize={tickFontSize}
          />

          {xAxisLabel && (
            <AxisLabel
              label={xAxisLabel}
              x={innerWidth / 2}
              y={bottomLegendOffset}
              fontSize={legendFontSize}
            />
          )}
        </g>

        <g>
          <LeftAxisTicks
            leftTickValues={leftTickValues}
            getLeftTickPosition={getLeftTickPosition}
            formatLeftTick={formatLeftTick}
            tickPadding={axisConfig.tickPadding}
            tickFontSize={tickFontSize}
          />

          {yAxisLabel && (
            <AxisLabel
              label={yAxisLabel}
              x={leftLegendOffset}
              y={innerHeight / 2}
              fontSize={legendFontSize}
              rotation={-90}
            />
          )}
        </g>
      </g>
    </StyledSvgOverlay>
  );
};
