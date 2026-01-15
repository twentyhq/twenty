import { graphWidgetHoveredSliceIndexComponentState } from '@/page-layout/widgets/graph/graphWidgetBarChart/states/graphWidgetHoveredSliceIndexComponentState';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { computeSliceHighlightPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeSliceHighlightPosition';
import { computeSlicesFromBars } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeSlicesFromBars';
import { findSliceAtPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/findSliceAtPosition';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import { type BarDatum, type ComputedBarDatum } from '@nivo/bar';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useMemo, type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { BarChartLayout } from '~/generated/graphql';

type SliceHoverCallbackData = {
  slice: BarChartSlice;
  offsetLeft: number;
  offsetTop: number;
};

type CustomSliceHoverLayerProps = {
  bars: readonly ComputedBarDatum<BarDatum>[];
  innerWidth: number;
  innerHeight: number;
  marginLeft: number;
  marginTop: number;
  layout: BarChartLayout;
  onSliceHover: (data: SliceHoverCallbackData | null) => void;
  onSliceClick?: (slice: BarChartSlice) => void;
  onSliceLeave: () => void;
};

export const CustomSliceHoverLayer = ({
  bars,
  innerWidth,
  innerHeight,
  marginLeft,
  marginTop,
  layout,
  onSliceHover,
  onSliceClick,
  onSliceLeave,
}: CustomSliceHoverLayerProps) => {
  const theme = useTheme();

  const hoveredSliceIndexValue = useRecoilComponentValue(
    graphWidgetHoveredSliceIndexComponentState,
  );

  const isVerticalLayout = layout === BarChartLayout.VERTICAL;

  const slices = useMemo(
    () => computeSlicesFromBars({ bars, isVerticalLayout }),
    [bars, isVerticalLayout],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent<SVGRectElement>) => {
      const sliceData = findSliceAtPosition({
        event,
        slices,
        marginLeft,
        marginTop,
        isVerticalLayout,
      });

      if (!isDefined(sliceData)) {
        if (isDefined(hoveredSliceIndexValue)) {
          onSliceHover(null);
        }
        return;
      }

      if (sliceData.slice.indexValue === hoveredSliceIndexValue) {
        return;
      }

      onSliceHover(sliceData);
    },
    [
      onSliceHover,
      slices,
      marginLeft,
      marginTop,
      isVerticalLayout,
      hoveredSliceIndexValue,
    ],
  );

  const handleMouseLeave = () => {
    onSliceLeave();
  };

  const handleClick = (event: MouseEvent<SVGRectElement>) => {
    if (!isDefined(onSliceClick)) {
      return;
    }

    const sliceData = findSliceAtPosition({
      event,
      slices,
      marginLeft,
      marginTop,
      isVerticalLayout,
    });

    if (!isDefined(sliceData)) {
      return;
    }

    onSliceClick(sliceData.slice);
  };

  const hoveredSlice = useMemo(() => {
    if (!isDefined(hoveredSliceIndexValue)) {
      return null;
    }
    return slices.find((slice) => slice.indexValue === hoveredSliceIndexValue);
  }, [slices, hoveredSliceIndexValue]);

  const highlightPosition = computeSliceHighlightPosition({
    sliceCenter: hoveredSlice?.sliceCenter ?? null,
    isVerticalLayout,
    innerWidth,
    innerHeight,
  });

  if (bars.length === 0) {
    return null;
  }

  return (
    <g>
      <AnimatePresence>
        {isDefined(hoveredSlice) && (
          <motion.g
            key="highlight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: theme.animation.duration.fast,
              ease: 'easeInOut',
            }}
            transform={`translate(${highlightPosition.x}, ${highlightPosition.y})`}
          >
            <rect
              width={highlightPosition.width}
              height={highlightPosition.height}
              fill={theme.background.transparent.medium}
              style={{ pointerEvents: 'none' }}
            />
          </motion.g>
        )}
      </AnimatePresence>

      <rect
        x={0}
        y={0}
        width={innerWidth}
        height={innerHeight}
        fill="transparent"
        style={{ cursor: isDefined(onSliceClick) ? 'pointer' : 'default' }}
        onMouseEnter={handleMouseMove}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
    </g>
  );
};
