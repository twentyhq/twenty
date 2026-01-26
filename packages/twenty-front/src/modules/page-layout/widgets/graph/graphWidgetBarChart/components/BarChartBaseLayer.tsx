import { CHART_CORE_CONSTANTS } from '@/page-layout/widgets/graph/chart-core/constants/ChartCoreConstants';
import { computeZeroPixel } from '@/page-layout/widgets/graph/chart-core/utils/computeZeroPixel';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarPositions';
import { renderBars } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/renderBars';
import { renderGrid } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/renderGrid';
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
  durationMs: number;
  isAnimating: boolean;
} | null;

const StyledBaseCanvas = styled.canvas`
  display: block;
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
`;

const getBarKey = (bar: BarPosition) => `${bar.indexValue}::${bar.seriesId}`;

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

const easeOutCubic = (t: number) =>
  1 - Math.pow(1 - t, BAR_CHART_CONSTANTS.ANIMATION_EASING_EXPONENT);

const buildBarMap = (bars: BarPosition[]) =>
  new Map(bars.map((bar) => [getBarKey(bar), bar]));

const interpolateBars = (
  sourceBars: BarPosition[],
  targetBars: BarPosition[],
  t: number,
  toBaselineBar: (bar: BarPosition) => BarPosition,
): BarPosition[] => {
  const sourceMap = buildBarMap(sourceBars);
  const targetMap = buildBarMap(targetBars);
  const allKeys = new Set([...sourceMap.keys(), ...targetMap.keys()]);
  const eased = easeOutCubic(t);

  const result: BarPosition[] = [];

  for (const key of allKeys) {
    const fromBar = sourceMap.get(key);
    const toBar = targetMap.get(key);

    if (!fromBar && !toBar) {
      continue;
    }

    const startBar = fromBar ?? toBaselineBar(toBar as BarPosition);
    const endBar = toBar ?? toBaselineBar(fromBar as BarPosition);

    result.push({
      ...endBar,
      x: lerp(startBar.x, endBar.x, eased),
      y: lerp(startBar.y, endBar.y, eased),
      width: lerp(startBar.width, endBar.width, eased),
      height: lerp(startBar.height, endBar.height, eased),
      value: lerp(startBar.value, endBar.value, eased),
      color: endBar.color ?? startBar.color,
      seriesId: endBar.seriesId ?? startBar.seriesId,
      indexValue: endBar.indexValue ?? startBar.indexValue,
      shouldRoundFreeEnd:
        endBar.shouldRoundFreeEnd ?? startBar.shouldRoundFreeEnd,
      seriesIndex: endBar.seriesIndex ?? startBar.seriesIndex,
    });
  }

  return result;
};

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
  const [dpr] = useState<number>(
    () =>
      window.devicePixelRatio ||
      CHART_CORE_CONSTANTS.DEFAULT_DEVICE_PIXEL_RATIO,
  );
  const [chartSize, setChartSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [animationState, setAnimationState] = useState<AnimationState>(null);

  const borderRadius = parseInt(theme.border.radius.sm);
  const gridColor = theme.border.color.light;
  const isVertical = layout === BarChartLayout.VERTICAL;
  const durationMs =
    theme.animation.duration.normal *
    CHART_CORE_CONSTANTS.MILLISECONDS_PER_SECOND;

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
        renderGrid({
          ctx,
          innerWidth,
          innerHeight,
          valueTickValues,
          valueDomain,
          isVertical,
          gridColor,
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
      chartSize !== null &&
      chartSize.width === chartWidth &&
      chartSize.height === chartHeight;

    if (!sizeIsStable) {
      setChartSize({ width: chartWidth, height: chartHeight });
      setAnimationState({
        sourceBars: bars,
        targetBars: bars,
        startTime: performance.now(),
        durationMs,
        isAnimating: false,
      });
      return;
    }

    if (!allowDataTransitions) {
      setAnimationState({
        sourceBars: bars,
        targetBars: bars,
        startTime: performance.now(),
        durationMs,
        isAnimating: false,
      });
      return;
    }

    setAnimationState((prev) => {
      const now = performance.now();

      if (!prev) {
        return {
          sourceBars: bars,
          targetBars: bars,
          startTime: now,
          durationMs,
          isAnimating: false,
        };
      }

      if (prev.targetBars === bars) {
        return prev;
      }

      if (bars.length === 0 && prev.targetBars.length === 0) {
        return {
          sourceBars: bars,
          targetBars: bars,
          startTime: now,
          durationMs,
          isAnimating: false,
        };
      }

      const sourceBars = prev.isAnimating
        ? interpolateBars(
            prev.sourceBars,
            prev.targetBars,
            Math.min((now - prev.startTime) / prev.durationMs, 1),
            toBaselineBar,
          )
        : prev.targetBars;

      return {
        sourceBars,
        targetBars: bars,
        startTime: now,
        durationMs,
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

    const staticBars = animationState?.targetBars ?? bars;

    if (
      !animationState ||
      !animationState.isAnimating ||
      animationState.sourceBars === animationState.targetBars
    ) {
      renderBase(ctx, chartWidth, chartHeight, staticBars);
      return;
    }

    let frameId = 0;

    const drawFrame = () => {
      const elapsed = performance.now() - animationState.startTime;
      const t = Math.min(elapsed / animationState.durationMs, 1);

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
    renderBase,
    toBaselineBar,
  ]);

  return <StyledBaseCanvas ref={canvasRef} />;
};
