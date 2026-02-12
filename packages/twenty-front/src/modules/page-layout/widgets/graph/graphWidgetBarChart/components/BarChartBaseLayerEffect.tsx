import { CHART_CORE_CONSTANTS } from '@/page-layout/widgets/graph/chart-core/constants/ChartCoreConstants';
import { computeValueScale } from '@/page-layout/widgets/graph/chart-core/utils/computeValueScale';
import { renderGridLayer } from '@/page-layout/widgets/graph/chart-core/utils/renderGridLayer';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';
import { computeBaselineBar } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBaselineBar';
import { interpolateBars } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/interpolateBars';
import { renderBars } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/renderBars';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { useTheme } from '@emotion/react';
import { useCallback, useEffect, useState, type RefObject } from 'react';
import { BarChartLayout } from '~/generated-metadata/graphql';

type BarChartBaseLayerEffectProps = {
  bars: BarPosition[];
  chartWidth: number;
  chartHeight: number;
  margins: ChartMargins;
  layout: BarChartLayout;
  valueDomain: { min: number; max: number };
  valueTickValues: number[];
  showGrid: boolean;
  highlightedLegendId: string | null;
  allowDataTransitions: boolean;
  canvasRef: RefObject<HTMLCanvasElement>;
};

type AnimationState = {
  sourceBars: BarPosition[];
  targetBars: BarPosition[];
  startTime: number;
  isAnimating: boolean;
};

export const BarChartBaseLayerEffect = ({
  bars,
  chartWidth,
  chartHeight,
  margins,
  layout,
  valueDomain,
  valueTickValues,
  showGrid,
  highlightedLegendId,
  allowDataTransitions,
  canvasRef,
}: BarChartBaseLayerEffectProps) => {
  const theme = useTheme();

  const borderRadius = parseInt(theme.border.radius.sm);
  const gridColor = theme.border.color.light;
  const isVertical = layout === BarChartLayout.VERTICAL;
  const durationMs =
    theme.animation.duration.normal *
    CHART_CORE_CONSTANTS.MILLISECONDS_PER_SECOND;

  const [dpr] = useState<number>(
    () =>
      (typeof window !== 'undefined' ? window.devicePixelRatio : undefined) ||
      CHART_CORE_CONSTANTS.DEFAULT_DEVICE_PIXEL_RATIO,
  );
  const [chartSize, setChartSize] = useState(() => ({
    width: chartWidth,
    height: chartHeight,
  }));
  const [animationState, setAnimationState] = useState<AnimationState>(() => ({
    sourceBars: bars,
    targetBars: bars,
    startTime: performance.now(),
    isAnimating: false,
  }));

  const innerWidth = chartWidth - margins.left - margins.right;
  const innerHeight = chartHeight - margins.top - margins.bottom;
  const axisLength = isVertical ? innerHeight : innerWidth;
  const { valueToPixel } = computeValueScale({
    domain: valueDomain,
    axisLength,
  });
  const zeroPixel = valueToPixel(0);

  const toBaselineBar = useCallback(
    (bar: BarPosition): BarPosition =>
      computeBaselineBar({ bar, innerHeight, zeroPixel, isVertical }),
    [innerHeight, zeroPixel, isVertical],
  );

  useEffect(() => {
    const sizeIsStable =
      chartSize.width === chartWidth && chartSize.height === chartHeight;

    if (!sizeIsStable) {
      setChartSize({ width: chartWidth, height: chartHeight });
      setAnimationState({
        sourceBars: bars,
        targetBars: bars,
        startTime: performance.now(),
        isAnimating: false,
      });
      return;
    }

    if (!allowDataTransitions) {
      setAnimationState({
        sourceBars: bars,
        targetBars: bars,
        startTime: performance.now(),
        isAnimating: false,
      });
      return;
    }

    setAnimationState((prev) => {
      const now = performance.now();

      if (prev.targetBars === bars) {
        return prev;
      }

      if (bars.length === 0 && prev.targetBars.length === 0) {
        return {
          sourceBars: bars,
          targetBars: bars,
          startTime: now,
          isAnimating: false,
        };
      }

      const sourceBars = prev.isAnimating
        ? interpolateBars(
            prev.sourceBars,
            prev.targetBars,
            Math.min((now - prev.startTime) / durationMs, 1),
            toBaselineBar,
          )
        : prev.targetBars;

      return {
        sourceBars,
        targetBars: bars,
        startTime: now,
        isAnimating: true,
      };
    });
  }, [
    allowDataTransitions,
    bars,
    chartHeight,
    chartSize,
    chartWidth,
    durationMs,
    toBaselineBar,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    if (chartWidth <= 0 || chartHeight <= 0) {
      return;
    }

    canvas.width = chartWidth * dpr;
    canvas.height = chartHeight * dpr;
    canvas.style.width = `${chartWidth}px`;
    canvas.style.height = `${chartHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const render = (barsToRender: BarPosition[]) => {
      const innerW = chartWidth - margins.left - margins.right;
      const innerH = chartHeight - margins.top - margins.bottom;

      ctx.clearRect(0, 0, chartWidth, chartHeight);
      ctx.save();
      ctx.translate(margins.left, margins.top);

      if (showGrid) {
        renderGridLayer({
          ctx,
          innerWidth: innerW,
          innerHeight: innerH,
          valueTickValues,
          valueDomain,
          isVertical,
          gridColor,
          lineWidth: BAR_CHART_CONSTANTS.GRID_LINE_WIDTH,
          dashLength: BAR_CHART_CONSTANTS.GRID_DASH_LENGTH,
          dashGap: BAR_CHART_CONSTANTS.GRID_DASH_GAP,
        });
      }

      renderBars({
        ctx,
        bars: barsToRender,
        borderRadius,
        isVertical,
        highlightedLegendId,
      });

      ctx.restore();
    };

    if (
      !animationState.isAnimating ||
      animationState.sourceBars === animationState.targetBars
    ) {
      render(animationState.targetBars);
      return;
    }

    let frameId = 0;

    const drawFrame = () => {
      const elapsed = performance.now() - animationState.startTime;
      const t = Math.min(elapsed / durationMs, 1);

      if (t >= 1) {
        render(animationState.targetBars);
        return;
      }

      const interpolatedBars = interpolateBars(
        animationState.sourceBars,
        animationState.targetBars,
        t,
        toBaselineBar,
      );

      render(interpolatedBars);

      frameId = requestAnimationFrame(drawFrame);
    };

    frameId = requestAnimationFrame(drawFrame);

    return () => cancelAnimationFrame(frameId);
  }, [
    animationState,
    borderRadius,
    chartHeight,
    chartWidth,
    dpr,
    durationMs,
    gridColor,
    highlightedLegendId,
    isVertical,
    margins.bottom,
    margins.left,
    margins.right,
    margins.top,
    showGrid,
    toBaselineBar,
    valueDomain,
    valueTickValues,
    canvasRef,
  ]);

  return null;
};
