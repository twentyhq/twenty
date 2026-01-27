import { CHART_CORE_CONSTANTS } from '@/page-layout/widgets/graph/chart-core/constants/ChartCoreConstants';
import { renderGridLayer } from '@/page-layout/widgets/graph/chart-core/utils/renderGridLayer';
import { computeZeroPixel } from '@/page-layout/widgets/graph/chart-core/utils/computeZeroPixel';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';
import { interpolateBars } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/interpolateBars';
import { renderBars } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/renderBars';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BarChartLayout } from '~/generated/graphql';

type BarChartBaseLayerProps = {
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
};

type AnimationState = {
  sourceBars: BarPosition[];
  targetBars: BarPosition[];
  startTime: number;
  isAnimating: boolean;
};

const StyledBaseCanvas = styled.canvas`
  display: block;
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
`;

export const BarChartBaseLayer = ({
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
}: BarChartBaseLayerProps) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const renderBase = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      barsToRender: BarPosition[],
    ) => {
      const innerWidth = width - margins.left - margins.right;
      const innerHeight = height - margins.top - margins.bottom;

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(margins.left, margins.top);

      if (showGrid) {
        renderGridLayer({
          ctx,
          innerWidth,
          innerHeight,
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
    },
    [
      margins,
      showGrid,
      valueTickValues,
      valueDomain,
      isVertical,
      gridColor,
      borderRadius,
      highlightedLegendId,
    ],
  );

  const animationContext = useMemo(() => {
    const innerWidth = chartWidth - margins.left - margins.right;
    const innerHeight = chartHeight - margins.top - margins.bottom;
    const axisLength = isVertical ? innerHeight : innerWidth;
    const zeroPixel = computeZeroPixel({ domain: valueDomain, axisLength });
    return {
      innerHeight,
      zeroPixel,
    };
  }, [
    chartWidth,
    chartHeight,
    margins.left,
    margins.right,
    margins.top,
    margins.bottom,
    isVertical,
    valueDomain,
  ]);

  const toBaselineBar = useCallback(
    (bar: BarPosition): BarPosition => {
      const { innerHeight, zeroPixel } = animationContext;
      const baselineY = innerHeight - zeroPixel;

      if (isVertical) {
        return {
          ...bar,
          y: baselineY,
          height: 0,
          value: 0,
        };
      }

      return {
        ...bar,
        x: zeroPixel,
        width: 0,
        value: 0,
      };
    },
    [animationContext, isVertical],
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

    if (
      !animationState.isAnimating ||
      animationState.sourceBars === animationState.targetBars
    ) {
      renderBase(ctx, chartWidth, chartHeight, animationState.targetBars);
      return;
    }

    let frameId = 0;

    const drawFrame = () => {
      const elapsed = performance.now() - animationState.startTime;
      const t = Math.min(elapsed / durationMs, 1);

      if (t >= 1) {
        renderBase(ctx, chartWidth, chartHeight, animationState.targetBars);
        return;
      }

      const interpolatedBars = interpolateBars(
        animationState.sourceBars,
        animationState.targetBars,
        t,
        toBaselineBar,
      );

      renderBase(ctx, chartWidth, chartHeight, interpolatedBars);

      frameId = requestAnimationFrame(drawFrame);
    };

    frameId = requestAnimationFrame(drawFrame);

    return () => cancelAnimationFrame(frameId);
  }, [
    animationState,
    bars,
    chartHeight,
    chartWidth,
    dpr,
    durationMs,
    renderBase,
    toBaselineBar,
  ]);

  return <StyledBaseCanvas ref={canvasRef} />;
};
