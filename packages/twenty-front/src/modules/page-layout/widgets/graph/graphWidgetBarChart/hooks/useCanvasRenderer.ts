import { LEGEND_HIGHLIGHT_DIMMED_OPACITY } from '@/page-layout/widgets/graph/constants/LegendHighlightDimmedOpacity.constant';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarPositions';
import {
  drawHorizontalRoundedRect,
  drawRoundedRect,
} from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/drawRoundedRect';
import { type CanvasBarSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/findSliceAtCanvasPosition';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { BarChartLayout } from '~/generated/graphql';

type UseCanvasRendererParams = {
  margins: ChartMargins;
  layout: BarChartLayout;
  borderRadius: number;
  gridColor: string;
  highlightColor: string;
  showGrid: boolean;
  valueTickValues: number[];
  valueDomain: { min: number; max: number };
  highlightedLegendId: string | null;
  hoveredSlice: CanvasBarSlice | null;
};

export const useCanvasRenderer = ({
  margins,
  layout,
  borderRadius,
  gridColor,
  highlightColor,
  showGrid,
  valueTickValues,
  valueDomain,
  highlightedLegendId,
  hoveredSlice,
}: UseCanvasRendererParams) => {
  const isVertical = layout === BarChartLayout.VERTICAL;

  const render = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      bars: BarPosition[],
    ) => {
      const innerWidth = width - margins.left - margins.right;
      const innerHeight = height - margins.top - margins.bottom;

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(margins.left, margins.top);

      if (showGrid) {
        drawGrid(
          ctx,
          innerWidth,
          innerHeight,
          valueTickValues,
          valueDomain,
          isVertical,
          gridColor,
        );
      }

      if (isDefined(hoveredSlice)) {
        drawSliceHighlight(
          ctx,
          hoveredSlice,
          innerWidth,
          innerHeight,
          isVertical,
          highlightColor,
        );
      }

      drawBars(ctx, bars, borderRadius, isVertical, highlightedLegendId);

      ctx.restore();
    },
    [
      margins,
      borderRadius,
      gridColor,
      highlightColor,
      showGrid,
      valueTickValues,
      valueDomain,
      highlightedLegendId,
      hoveredSlice,
      isVertical,
    ],
  );

  return { render };
};

const drawGrid = (
  ctx: CanvasRenderingContext2D,
  innerWidth: number,
  innerHeight: number,
  valueTickValues: number[],
  valueDomain: { min: number; max: number },
  isVertical: boolean,
  gridColor: string,
) => {
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  const range = valueDomain.max - valueDomain.min;
  if (range === 0) {
    return;
  }

  for (const tickValue of valueTickValues) {
    const normalizedPosition = (tickValue - valueDomain.min) / range;

    ctx.beginPath();
    if (isVertical) {
      const y = innerHeight * (1 - normalizedPosition);
      ctx.moveTo(0, y);
      ctx.lineTo(innerWidth, y);
    } else {
      const x = innerWidth * normalizedPosition;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, innerHeight);
    }
    ctx.stroke();
  }

  ctx.setLineDash([]);
};

const drawSliceHighlight = (
  ctx: CanvasRenderingContext2D,
  slice: CanvasBarSlice,
  innerWidth: number,
  innerHeight: number,
  isVertical: boolean,
  highlightColor: string,
) => {
  const halfThickness = BAR_CHART_CONSTANTS.SLICE_HIGHLIGHT_THICKNESS / 2;
  const center = slice.sliceCenter;

  ctx.fillStyle = highlightColor;

  if (isVertical) {
    ctx.fillRect(
      center - halfThickness,
      0,
      BAR_CHART_CONSTANTS.SLICE_HIGHLIGHT_THICKNESS,
      innerHeight,
    );
  } else {
    ctx.fillRect(
      0,
      center - halfThickness,
      innerWidth,
      BAR_CHART_CONSTANTS.SLICE_HIGHLIGHT_THICKNESS,
    );
  }
};

const drawBars = (
  ctx: CanvasRenderingContext2D,
  bars: BarPosition[],
  borderRadius: number,
  isVertical: boolean,
  highlightedLegendId: string | null,
) => {
  for (const bar of bars) {
    const isDimmed =
      highlightedLegendId !== null && bar.seriesId !== highlightedLegendId;

    ctx.globalAlpha = isDimmed ? LEGEND_HIGHLIGHT_DIMMED_OPACITY : 1;
    ctx.fillStyle = bar.color;

    const isNegative = bar.value < 0;

    if (isVertical) {
      const roundTop = bar.shouldRoundFreeEnd && !isNegative;
      const roundBottom = bar.shouldRoundFreeEnd && isNegative;

      drawRoundedRect({
        ctx,
        x: bar.x,
        y: bar.y,
        width: bar.width,
        height: bar.height,
        radius: borderRadius,
        roundTop,
        roundBottom,
      });
    } else {
      const roundRight = bar.shouldRoundFreeEnd && !isNegative;
      const roundLeft = bar.shouldRoundFreeEnd && isNegative;

      drawHorizontalRoundedRect({
        ctx,
        x: bar.x,
        y: bar.y,
        width: bar.width,
        height: bar.height,
        radius: borderRadius,
        roundLeft,
        roundRight,
      });
    }
  }

  ctx.globalAlpha = 1;
};
