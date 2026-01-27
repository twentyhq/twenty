import { computeBandScale } from '@/page-layout/widgets/graph/chart-core/utils/computeBandScale';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

type AxisLayerConfig = {
  tickFontSize: number;
  legendFontSize: number;
  tickPadding: number;
  rotatedLabelsExtraMargin: number;
  bottomAxisLegendOffset: number;
  leftAxisLegendOffsetPadding: number;
  legendOffsetMarginBuffer: number;
  categoryPadding: number;
  categoryOuterPaddingPx: number;
};

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

  const innerWidth = chartWidth - margins.left - margins.right;
  const innerHeight = chartHeight - margins.top - margins.bottom;

  const categoryIndexMap = new Map<string, number>(
    categoryValues.map((value, index) => [String(value), index]),
  );

  const categoryScale = computeBandScale({
    axisLength: isVertical ? innerWidth : innerHeight,
    count: categoryValues.length,
    padding: axisConfig.categoryPadding,
    outerPaddingPx: axisConfig.categoryOuterPaddingPx,
  });

  const bottomTickValues = isVertical ? categoryTickValues : valueTickValues;
  const leftTickValues = isVertical ? valueTickValues : categoryTickValues;

  const computeBottomTickPosition = (
    value: string | number,
    index: number,
  ): number => {
    if (isVertical) {
      if (categoryValues.length === 0) return 0;
      const rawIndex =
        categoryIndexMap.get(String(value)) ??
        Math.min(index, categoryValues.length - 1);
      const categoryIndex = Math.min(
        Math.max(rawIndex, 0),
        categoryValues.length - 1,
      );
      const start = categoryScale.offset + categoryIndex * categoryScale.step;
      return start + categoryScale.bandwidth / 2;
    }
    const range = valueDomain.max - valueDomain.min;
    if (range === 0) return 0;
    return ((Number(value) - valueDomain.min) / range) * innerWidth;
  };

  const computeLeftTickPosition = (
    value: string | number,
    index: number,
  ): number => {
    if (isVertical) {
      const range = valueDomain.max - valueDomain.min;
      if (range === 0) {
        return innerHeight;
      }
      return (
        innerHeight - ((Number(value) - valueDomain.min) / range) * innerHeight
      );
    }
    const categoryCount = categoryValues.length;
    if (categoryCount === 0) {
      return 0;
    }
    const rawIndex =
      categoryIndexMap.get(String(value)) ?? Math.min(index, categoryCount - 1);
    const clampedIndex = Math.min(Math.max(rawIndex, 0), categoryCount - 1);
    const effectiveIndex = categoryCount - 1 - clampedIndex;
    const start = categoryScale.offset + effectiveIndex * categoryScale.step;
    return start + categoryScale.bandwidth / 2;
  };

  const hasRotation = bottomAxisTickRotation !== 0;

  const rotatedLabelsExtraMargin = hasRotation
    ? axisConfig.rotatedLabelsExtraMargin
    : 0;
  const bottomLegendOffset = Math.min(
    axisConfig.bottomAxisLegendOffset + rotatedLabelsExtraMargin,
    Math.max(margins.bottom - axisConfig.legendOffsetMarginBuffer, 0),
  );

  const leftLegendOffset =
    -margins.left + axisConfig.leftAxisLegendOffsetPadding;

  const valueRange = valueDomain.max - valueDomain.min;
  const shouldRenderZeroLine = hasNegativeValues && valueRange !== 0;
  const zeroPosition = shouldRenderZeroLine
    ? isVertical
      ? innerHeight - ((0 - valueDomain.min) / valueRange) * innerHeight
      : ((0 - valueDomain.min) / valueRange) * innerWidth
    : 0;

  return (
    <StyledSvgOverlay width={chartWidth} height={chartHeight}>
      <g transform={`translate(${margins.left}, ${margins.top})`}>
        <line
          x1={0}
          y1={innerHeight}
          x2={innerWidth}
          y2={innerHeight}
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
          <line
            x1={isVertical ? 0 : zeroPosition}
            y1={isVertical ? zeroPosition : 0}
            x2={isVertical ? innerWidth : zeroPosition}
            y2={isVertical ? zeroPosition : innerHeight}
            stroke={theme.border.color.medium}
            strokeWidth={1}
          />
        )}

        <g transform={`translate(0, ${innerHeight})`}>
          {bottomTickValues.map((value, index) => {
            const x = computeBottomTickPosition(value, index);
            const label = formatBottomTick(value);

            return (
              <g key={`bottom-tick-${index}`} transform={`translate(${x}, 0)`}>
                <text
                  x={0}
                  y={axisConfig.tickPadding + tickFontSize}
                  textAnchor={hasRotation ? 'end' : 'middle'}
                  transform={
                    hasRotation
                      ? `rotate(${bottomAxisTickRotation}, 0, ${axisConfig.tickPadding + tickFontSize / 2})`
                      : undefined
                  }
                  fill={theme.font.color.secondary}
                  fontSize={tickFontSize}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {xAxisLabel && (
            <text
              x={innerWidth / 2}
              y={bottomLegendOffset}
              textAnchor="middle"
              fill={theme.font.color.primary}
              fontSize={legendFontSize}
              fontWeight={theme.font.weight.medium}
            >
              {xAxisLabel}
            </text>
          )}
        </g>

        <g>
          {leftTickValues.map((value, index) => {
            const y = computeLeftTickPosition(value, index);
            const label = formatLeftTick(value);

            return (
              <g key={`left-tick-${index}`} transform={`translate(0, ${y})`}>
                <text
                  x={-axisConfig.tickPadding}
                  y={0}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill={theme.font.color.secondary}
                  fontSize={tickFontSize}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {yAxisLabel && (
            <text
              x={leftLegendOffset}
              y={innerHeight / 2}
              textAnchor="middle"
              transform={`rotate(-90, ${leftLegendOffset}, ${innerHeight / 2})`}
              fill={theme.font.color.primary}
              fontSize={legendFontSize}
              fontWeight={theme.font.weight.medium}
            >
              {yAxisLabel}
            </text>
          )}
        </g>
      </g>
    </StyledSvgOverlay>
  );
};
