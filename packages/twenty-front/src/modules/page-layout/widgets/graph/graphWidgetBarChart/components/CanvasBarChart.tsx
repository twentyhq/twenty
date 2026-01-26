import { useBarPositions } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarPositions';
import { useCanvasRenderer } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useCanvasRenderer';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarPositions';
import {
  computeAllCategorySlices,
  findAnchorBarInCanvasSlice,
  findSliceAtCanvasPosition,
  type CanvasBarSlice,
} from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/findSliceAtCanvasPosition';
import { graphWidgetHighlightedLegendIdComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHighlightedLegendIdComponentState';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import { isDefined } from 'twenty-shared/utils';
import { BarChartLayout } from '~/generated/graphql';

type CanvasBarChartProps = {
  data: Record<string, unknown>[];
  indexBy: string;
  keys: string[];
  enrichedKeysMap: Map<string, BarChartEnrichedKey>;
  chartWidth: number;
  chartHeight: number;
  margins: ChartMargins;
  layout: BarChartLayout;
  groupMode: 'grouped' | 'stacked';
  valueDomain: { min: number; max: number };
  innerPadding: number;
  showGrid: boolean;
  valueTickValues: number[];
  hoveredSliceIndexValue: string | null;
  onSliceHover: (
    data: {
      slice: CanvasBarSlice;
      offsetLeft: number;
      offsetTop: number;
    } | null,
  ) => void;
  onSliceClick?: (slice: CanvasBarSlice) => void;
  onSliceLeave: () => void;
  allowDataTransitions: boolean;
};

const StyledCanvasContainer = styled.div<{ $isClickable: boolean }>`
  cursor: ${({ $isClickable }) => ($isClickable ? 'pointer' : 'default')};
  height: 100%;
  position: relative;
  width: 100%;
`;

const StyledCanvas = styled.canvas`
  display: block;
  position: absolute;
  top: 0;
  left: 0;
`;

const getBarKey = (bar: BarPosition) => `${bar.indexValue}::${bar.seriesId}`;

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const buildBarMap = (bars: BarPosition[]) =>
  new Map(bars.map((bar) => [getBarKey(bar), bar]));

export const CanvasBarChart = ({
  data,
  indexBy,
  keys,
  enrichedKeysMap,
  chartWidth,
  chartHeight,
  margins,
  layout,
  groupMode,
  valueDomain,
  innerPadding,
  showGrid,
  valueTickValues,
  hoveredSliceIndexValue,
  onSliceHover,
  onSliceClick,
  onSliceLeave,
  allowDataTransitions,
}: CanvasBarChartProps) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dpr, setDpr] = useState(1);
  const [previousBars, setPreviousBars] = useState<BarPosition[]>([]);
  const [previousSize, setPreviousSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const highlightedLegendId = useRecoilComponentValue(
    graphWidgetHighlightedLegendIdComponentState,
  );

  const borderRadius = parseInt(theme.border.radius.sm);
  const gridColor = theme.border.color.light;
  const highlightColor = theme.background.transparent.medium;
  const fallbackColor = theme.border.color.light;
  const isVertical = layout === BarChartLayout.VERTICAL;

  const bars = useBarPositions({
    data,
    indexBy,
    keys,
    enrichedKeysMap,
    chartWidth,
    chartHeight,
    margins,
    layout,
    groupMode,
    valueDomain,
    fallbackColor,
    innerPadding,
  });

  const slices = useMemo(
    () =>
      computeAllCategorySlices({
        data,
        indexBy,
        bars,
        isVerticalLayout: isVertical,
        chartWidth,
        chartHeight,
        margins,
      }),
    [data, indexBy, bars, isVertical, chartWidth, chartHeight, margins],
  );

  const hoveredSlice = useMemo(() => {
    if (!isDefined(hoveredSliceIndexValue)) {
      return null;
    }
    return (
      slices.find((slice) => slice.indexValue === hoveredSliceIndexValue) ??
      null
    );
  }, [slices, hoveredSliceIndexValue]);

  const { render } = useCanvasRenderer({
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
  });

  useEffect(() => {
    setDpr(window.devicePixelRatio || 1);
  }, []);

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
      render(ctx, chartWidth, chartHeight, bars);

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

    const innerWidth = chartWidth - margins.left - margins.right;
    const innerHeight = chartHeight - margins.top - margins.bottom;
    const axisLength = isVertical ? innerHeight : innerWidth;
    const range = valueDomain.max - valueDomain.min;
    const zeroPixel =
      range === 0 ? 0 : ((0 - valueDomain.min) / range) * axisLength;
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

    const durationMs = theme.animation.duration.normal * 1000;
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

      render(ctx, chartWidth, chartHeight, interpolatedBars);

      if (t < 1) {
        frameId = requestAnimationFrame(drawFrame);
        return;
      }

      render(ctx, chartWidth, chartHeight, bars);
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
    margins.bottom,
    margins.left,
    margins.right,
    margins.top,
    previousBars,
    previousSize,
    render,
    theme.animation.duration.fast,
    valueDomain.max,
    valueDomain.min,
    theme.animation.duration.normal,
  ]);

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left - margins.left;
      const y = event.clientY - rect.top - margins.top;
      const innerWidth = chartWidth - margins.left - margins.right;
      const innerHeight = chartHeight - margins.top - margins.bottom;

      if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) {
        if (isDefined(hoveredSliceIndexValue)) {
          onSliceHover(null);
        }
        return;
      }

      const slice = findSliceAtCanvasPosition({
        mouseX: x,
        mouseY: y,
        slices,
        isVerticalLayout: isVertical,
      });

      if (!isDefined(slice)) {
        if (isDefined(hoveredSliceIndexValue)) {
          onSliceHover(null);
        }
        return;
      }

      if (slice.indexValue === hoveredSliceIndexValue) {
        return;
      }

      let offsetLeft: number;
      let offsetTop: number;

      if (slice.bars.length === 0) {
        const innerHeight = chartHeight - margins.top - margins.bottom;
        offsetLeft = isVertical
          ? slice.sliceCenter + margins.left
          : margins.left;
        offsetTop = isVertical
          ? innerHeight + margins.top
          : slice.sliceCenter + margins.top;
      } else {
        const anchorBar = findAnchorBarInCanvasSlice({
          bars: slice.bars,
          isVerticalLayout: isVertical,
        });

        offsetLeft = isVertical
          ? slice.sliceCenter + margins.left
          : anchorBar.x + anchorBar.width + margins.left;
        offsetTop = isVertical
          ? anchorBar.y + margins.top
          : slice.sliceCenter + margins.top;
      }

      onSliceHover({
        slice,
        offsetLeft,
        offsetTop,
      });
    },
    [
      margins,
      slices,
      isVertical,
      hoveredSliceIndexValue,
      onSliceHover,
      chartHeight,
      chartWidth,
    ],
  );

  const handleMouseLeave = useCallback(() => {
    onSliceLeave();
  }, [onSliceLeave]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLCanvasElement>) => {
      if (!isDefined(onSliceClick)) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left - margins.left;
      const y = event.clientY - rect.top - margins.top;
      const innerWidth = chartWidth - margins.left - margins.right;
      const innerHeight = chartHeight - margins.top - margins.bottom;

      if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) {
        return;
      }

      const slice = findSliceAtCanvasPosition({
        mouseX: x,
        mouseY: y,
        slices,
        isVerticalLayout: isVertical,
      });

      if (isDefined(slice)) {
        onSliceClick(slice);
      }
    },
    [margins, slices, isVertical, onSliceClick, chartHeight, chartWidth],
  );

  return (
    <StyledCanvasContainer $isClickable={isDefined(onSliceClick)}>
      <StyledCanvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
    </StyledCanvasContainer>
  );
};
