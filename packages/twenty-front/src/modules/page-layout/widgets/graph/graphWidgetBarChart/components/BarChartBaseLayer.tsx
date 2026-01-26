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
  const [dpr, setDpr] = useState<number>(
    CHART_CORE_CONSTANTS.DEFAULT_DEVICE_PIXEL_RATIO,
  );
  const [previousBars, setPreviousBars] = useState<BarPosition[]>([]);
  const [previousSize, setPreviousSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const borderRadius = parseInt(theme.border.radius.sm);
  const gridColor = theme.border.color.light;
  const isVertical = layout === BarChartLayout.VERTICAL;

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

  useEffect(() => {
    setDpr(
      window.devicePixelRatio ||
        CHART_CORE_CONSTANTS.DEFAULT_DEVICE_PIXEL_RATIO,
    );
  }, []);

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

    const sizeIsStable =
      previousSize !== null &&
      previousSize.width === chartWidth &&
      previousSize.height === chartHeight;

    const shouldAnimate =
      allowDataTransitions &&
      sizeIsStable &&
      !(bars.length === 0 && previousBars.length === 0) &&
      previousBars !== bars;

    if (!shouldAnimate) {
      renderBase(ctx, chartWidth, chartHeight, bars);

      if (previousBars !== bars) {
        setPreviousBars(bars);
      }

      if (!sizeIsStable) {
        setPreviousSize({ width: chartWidth, height: chartHeight });
      }

      return;
    }

    const fromMap = buildBarMap(previousBars);
    const toMap = buildBarMap(bars);
    const allKeys = new Set([...fromMap.keys(), ...toMap.keys()]);

    const { innerHeight, zeroPixel } = animationContext;
    const baselineY = innerHeight - zeroPixel;

    const toBaselineBar = (bar: BarPosition): BarPosition => {
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
    };

    const durationMs =
      theme.animation.duration.normal *
      CHART_CORE_CONSTANTS.MILLISECONDS_PER_SECOND;
    const startTime = performance.now();
    let frameId = 0;

    const drawFrame = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = easeOutCubic(t);

      const interpolatedBars: BarPosition[] = [];

      for (const key of allKeys) {
        const fromBar = fromMap.get(key);
        const toBar = toMap.get(key);

        if (!fromBar && !toBar) {
          continue;
        }

        const startBar = fromBar ?? toBaselineBar(toBar as BarPosition);
        const endBar = toBar ?? toBaselineBar(fromBar as BarPosition);

        interpolatedBars.push({
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

      renderBase(ctx, chartWidth, chartHeight, interpolatedBars);

      if (t < 1) {
        frameId = requestAnimationFrame(drawFrame);
        return;
      }

      renderBase(ctx, chartWidth, chartHeight, bars);
      setPreviousBars(bars);
      setPreviousSize({ width: chartWidth, height: chartHeight });
    };

    frameId = requestAnimationFrame(drawFrame);

    return () => cancelAnimationFrame(frameId);
  }, [
    allowDataTransitions,
    bars,
    chartHeight,
    chartWidth,
    dpr,
    isVertical,
    previousBars,
    previousSize,
    renderBase,
    theme.animation.duration.normal,
    animationContext,
  ]);

  return <StyledBaseCanvas ref={canvasRef} />;
};
