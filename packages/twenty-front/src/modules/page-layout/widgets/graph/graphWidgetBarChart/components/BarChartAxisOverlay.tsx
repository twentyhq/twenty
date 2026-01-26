import { computeBandScale } from '@/page-layout/widgets/graph/chart-core/utils/computeBandScale';
import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { truncateTickLabel } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/truncateTickLabel';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { BarChartLayout } from '~/generated/graphql';

type BarChartAxisOverlayProps = {
  bottomAxisTickRotation: number;
  categoryValues: (string | number)[];
  categoryTickValues: (string | number)[];
  chartHeight: number;
  chartWidth: number;
  formatOptions: GraphValueFormatOptions;
  hasNegativeValues: boolean;
  layout: BarChartLayout;
  margins: ChartMargins;
  maxBottomAxisTickLabelLength: number;
  maxLeftAxisTickLabelLength: number;
  valueDomain: { min: number; max: number };
  valueTickValues: number[];
  xAxisLabel?: string;
  yAxisLabel?: string;
};

const StyledSvgOverlay = styled.svg`
  left: 0;
  overflow: visible;
  pointer-events: none;
  position: absolute;
  top: 0;
`;

export const BarChartAxisOverlay = ({
  chartWidth,
  chartHeight,
  margins,
  layout,
  categoryValues,
  categoryTickValues,
  valueTickValues,
  valueDomain,
  xAxisLabel,
  yAxisLabel,
  formatOptions,
  bottomAxisTickRotation,
  maxBottomAxisTickLabelLength,
  maxLeftAxisTickLabelLength,
  hasNegativeValues,
}: BarChartAxisOverlayProps) => {
  const theme = useTheme();
  const tickFontSize = 11;
  const legendFontSize = 12;
  const isVertical = layout === BarChartLayout.VERTICAL;

  const innerWidth = chartWidth - margins.left - margins.right;
  const innerHeight = chartHeight - margins.top - margins.bottom;

  const categoryIndexMap = new Map<string, number>(
    categoryValues.map((value, index) => [String(value), index]),
  );

  const categoryScale = computeBandScale({
    axisLength: isVertical ? innerWidth : innerHeight,
    count: categoryValues.length,
    padding: BAR_CHART_CONSTANTS.OUTER_PADDING_RATIO,
    outerPaddingPx: BAR_CHART_CONSTANTS.OUTER_PADDING_PX,
  });

  const bottomTickValues = isVertical ? categoryTickValues : valueTickValues;
  const leftTickValues = isVertical ? valueTickValues : categoryTickValues;

  const formatBottomTick = (value: string | number): string => {
    if (isVertical) {
      return truncateTickLabel(String(value), maxBottomAxisTickLabelLength);
    }
    return truncateTickLabel(
      formatGraphValue(Number(value), formatOptions),
      maxBottomAxisTickLabelLength,
    );
  };

  const formatLeftTick = (value: string | number): string => {
    if (isVertical) {
      return truncateTickLabel(
        formatGraphValue(Number(value), formatOptions),
        maxLeftAxisTickLabelLength,
      );
    }
    return truncateTickLabel(String(value), maxLeftAxisTickLabelLength);
  };

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
  const rotationAngle = bottomAxisTickRotation;

  const rotatedLabelsExtraMargin = hasRotation
    ? BAR_CHART_CONSTANTS.ROTATED_LABELS_EXTRA_BOTTOM_MARGIN
    : 0;
  const bottomLegendOffset = Math.min(
    BAR_CHART_CONSTANTS.BOTTOM_AXIS_LEGEND_OFFSET + rotatedLabelsExtraMargin,
    Math.max(
      margins.bottom - COMMON_CHART_CONSTANTS.LEGEND_OFFSET_MARGIN_BUFFER,
      0,
    ),
  );

  const leftLegendOffset =
    -margins.left + BAR_CHART_CONSTANTS.LEFT_AXIS_LEGEND_OFFSET_PADDING;

  const valueRange = valueDomain.max - valueDomain.min;
  const zeroRatio = (0 - valueDomain.min) / valueRange;
  const zeroPosition = isVertical
    ? innerHeight - zeroRatio * innerHeight
    : zeroRatio * innerWidth;

  return (
    <StyledSvgOverlay width={chartWidth} height={chartHeight}>
      <g transform={`translate(${margins.left}, ${margins.top})`}>
        {/* Bottom axis line */}
        <line
          x1={0}
          y1={innerHeight}
          x2={innerWidth}
          y2={innerHeight}
          stroke={theme.border.color.light}
          strokeWidth={1}
        />

        {/* Left axis line */}
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={innerHeight}
          stroke={theme.border.color.light}
          strokeWidth={1}
        />

        {/* Zero marker line */}
        {hasNegativeValues && (
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
                  y={BAR_CHART_CONSTANTS.TICK_PADDING + tickFontSize}
                  textAnchor={hasRotation ? 'end' : 'middle'}
                  transform={
                    hasRotation ? `rotate(${rotationAngle})` : undefined
                  }
                  fill={theme.font.color.secondary}
                  fontSize={tickFontSize}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Bottom axis label */}
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

        {/* Left axis ticks */}
        <g>
          {leftTickValues.map((value, index) => {
            const y = computeLeftTickPosition(value, index);
            const label = formatLeftTick(value);

            return (
              <g key={`left-tick-${index}`} transform={`translate(0, ${y})`}>
                <text
                  x={-BAR_CHART_CONSTANTS.TICK_PADDING}
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

          {/* Left axis label */}
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
