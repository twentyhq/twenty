import { useBarPositions } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarPositions';
import { useCanvasRenderer } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useCanvasRenderer';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
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
}: CanvasBarChartProps) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dpr, setDpr] = useState(1);

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
    bars,
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

    canvas.width = chartWidth * dpr;
    canvas.height = chartHeight * dpr;
    canvas.style.width = `${chartWidth}px`;
    canvas.style.height = `${chartHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.scale(dpr, dpr);
    render(ctx, chartWidth, chartHeight);
  }, [chartWidth, chartHeight, dpr, render]);

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
