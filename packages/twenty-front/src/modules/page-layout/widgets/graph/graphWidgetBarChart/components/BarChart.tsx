import { getPointerPosition } from '@/page-layout/widgets/graph/chart-core/utils/getPointerPosition';
import { isPointInChartArea } from '@/page-layout/widgets/graph/chart-core/utils/isPointInChartArea';
import { BarChartBaseLayer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChartBaseLayer';
import { BarChartHoverLayer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChartHoverLayer';
import { useBarPositions } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarPositions';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { computeAllCategorySlices } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeAllCategorySlices';
import { findAnchorBarInSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/findAnchorBarInSlice';
import { findSliceAtPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/findSliceAtPosition';
import { graphWidgetHighlightedLegendIdComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHighlightedLegendIdComponentState';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useCallback, useMemo, type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { BarChartLayout } from '~/generated/graphql';

type BarChartProps = {
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
      slice: BarChartSlice;
      offsetLeft: number;
      offsetTop: number;
    } | null,
  ) => void;
  onSliceClick?: (slice: BarChartSlice) => void;
  onSliceLeave: () => void;
  allowDataTransitions: boolean;
};

const StyledCanvasContainer = styled.div<{ $isClickable: boolean }>`
  cursor: ${({ $isClickable }) => ($isClickable ? 'pointer' : 'default')};
  height: 100%;
  position: relative;
  width: 100%;
`;

export const BarChart = ({
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
}: BarChartProps) => {
  const theme = useTheme();
  const highlightedLegendId = useRecoilComponentValue(
    graphWidgetHighlightedLegendIdComponentState,
  );

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

  const innerWidth = chartWidth - margins.left - margins.right;
  const innerHeight = chartHeight - margins.top - margins.bottom;

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const { x, y } = getPointerPosition({
        event,
        element: event.currentTarget,
      });

      const relativeX = x - margins.left;
      const relativeY = y - margins.top;

      if (
        !isPointInChartArea({
          x: relativeX,
          y: relativeY,
          innerWidth,
          innerHeight,
        })
      ) {
        if (isDefined(hoveredSliceIndexValue)) {
          onSliceHover(null);
        }
        return;
      }

      const slice = findSliceAtPosition({
        mouseX: relativeX,
        mouseY: relativeY,
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
        offsetLeft = isVertical
          ? slice.sliceCenter + margins.left
          : margins.left;
        offsetTop = isVertical
          ? innerHeight + margins.top
          : slice.sliceCenter + margins.top;
      } else {
        const anchorBar = findAnchorBarInSlice({
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
      margins.left,
      margins.top,
      innerWidth,
      innerHeight,
      slices,
      isVertical,
      hoveredSliceIndexValue,
      onSliceHover,
    ],
  );

  const handleMouseLeave = useCallback(() => {
    onSliceLeave();
  }, [onSliceLeave]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!isDefined(onSliceClick)) {
        return;
      }

      const { x, y } = getPointerPosition({
        event,
        element: event.currentTarget,
      });

      const relativeX = x - margins.left;
      const relativeY = y - margins.top;

      if (
        !isPointInChartArea({
          x: relativeX,
          y: relativeY,
          innerWidth,
          innerHeight,
        })
      ) {
        return;
      }

      const slice = findSliceAtPosition({
        mouseX: relativeX,
        mouseY: relativeY,
        slices,
        isVerticalLayout: isVertical,
      });

      if (isDefined(slice)) {
        onSliceClick(slice);
      }
    },
    [
      margins.left,
      margins.top,
      innerWidth,
      innerHeight,
      slices,
      isVertical,
      onSliceClick,
    ],
  );

  return (
    <StyledCanvasContainer
      $isClickable={isDefined(onSliceClick)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <BarChartBaseLayer
        bars={bars}
        chartHeight={chartHeight}
        chartWidth={chartWidth}
        highlightedLegendId={highlightedLegendId}
        layout={layout}
        margins={margins}
        showGrid={showGrid}
        valueDomain={valueDomain}
        valueTickValues={valueTickValues}
        allowDataTransitions={allowDataTransitions}
      />
      <BarChartHoverLayer
        hoveredSlice={hoveredSlice}
        chartHeight={chartHeight}
        chartWidth={chartWidth}
        layout={layout}
        margins={margins}
      />
    </StyledCanvasContainer>
  );
};
