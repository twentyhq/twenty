import { graphWidgetHoveredSliceIndexComponentState } from '@/page-layout/widgets/graph/graphWidgetBarChart/states/graphWidgetHoveredSliceIndexComponentState';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { computeSliceHighlightPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeSliceHighlightPosition';
import { computeSlicesFromBars } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeSlicesFromBars';
import { findAnchorBarInSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/findAnchorBarInSlice';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useTheme } from '@emotion/react';
import { type BarDatum, type ComputedBarDatum } from '@nivo/bar';
import { animated, useSpring } from '@react-spring/web';
import { useCallback, useMemo, type MouseEvent } from 'react';
import { useRecoilCallback } from 'recoil';
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
  const hoveredSliceIndex = useRecoilComponentValue(
    graphWidgetHoveredSliceIndexComponentState,
  );
  const hoveredSliceIndexState = useRecoilComponentCallbackState(
    graphWidgetHoveredSliceIndexComponentState,
  );
  const setHoveredSliceIndex = useSetRecoilComponentState(
    graphWidgetHoveredSliceIndexComponentState,
  );

  const isVerticalLayout = layout === BarChartLayout.VERTICAL;

  const slices = useMemo(
    () => computeSlicesFromBars({ bars, isVerticalLayout }),
    [bars, isVerticalLayout],
  );

  const findSliceAtMousePosition = useCallback(
    (event: MouseEvent<SVGRectElement>) => {
      const svgBoundingRectangle =
        event.currentTarget.ownerSVGElement?.getBoundingClientRect();

      if (!isDefined(svgBoundingRectangle) || slices.length === 0) {
        return null;
      }

      const mousePositionX =
        event.clientX - svgBoundingRectangle.left - marginLeft;
      const mousePositionY =
        event.clientY - svgBoundingRectangle.top - marginTop;

      const positionAlongAxis = isVerticalLayout
        ? mousePositionX
        : mousePositionY;

      const nearestSlice = slices.reduce((nearest, slice) => {
        const currentDistance = Math.abs(slice.sliceCenter - positionAlongAxis);
        const nearestDistance = Math.abs(
          nearest.sliceCenter - positionAlongAxis,
        );
        return currentDistance < nearestDistance ? slice : nearest;
      });

      const anchorBar = findAnchorBarInSlice(
        nearestSlice.bars,
        isVerticalLayout,
      );

      const offsetLeft = isVerticalLayout
        ? nearestSlice.sliceCenter + marginLeft
        : anchorBar.absX + anchorBar.width + marginLeft;
      const offsetTop = isVerticalLayout
        ? anchorBar.absY + marginTop
        : nearestSlice.sliceCenter + marginTop;

      return {
        slice: nearestSlice,
        offsetLeft,
        offsetTop,
      };
    },
    [slices, marginLeft, marginTop, isVerticalLayout],
  );

  const handleMouseMove = useRecoilCallback(
    ({ snapshot }) =>
      (event: MouseEvent<SVGRectElement>) => {
        const sliceData = findSliceAtMousePosition(event);
        const currentHoveredSliceIndex = snapshot
          .getLoadable(hoveredSliceIndexState)
          .getValue();

        if (!isDefined(sliceData)) {
          if (isDefined(currentHoveredSliceIndex)) {
            setHoveredSliceIndex(null);
            onSliceHover(null);
          }
          return;
        }

        if (sliceData.slice.indexValue === currentHoveredSliceIndex) {
          return;
        }

        setHoveredSliceIndex(sliceData.slice.indexValue);
        onSliceHover(sliceData);
      },
    [
      findSliceAtMousePosition,
      hoveredSliceIndexState,
      setHoveredSliceIndex,
      onSliceHover,
    ],
  );

  const handleMouseLeave = () => {
    onSliceLeave();
  };

  const handleClick = (event: MouseEvent<SVGRectElement>) => {
    if (!isDefined(onSliceClick)) {
      return;
    }

    const sliceData = findSliceAtMousePosition(event);

    if (!isDefined(sliceData)) {
      return;
    }

    onSliceClick(sliceData.slice);
  };

  const hoveredSlice = useMemo(() => {
    if (!isDefined(hoveredSliceIndex)) {
      return null;
    }
    return slices.find((slice) => slice.indexValue === hoveredSliceIndex);
  }, [slices, hoveredSliceIndex]);

  const highlightPosition = computeSliceHighlightPosition({
    sliceCenter: hoveredSlice?.sliceCenter ?? null,
    isVerticalLayout,
    innerWidth,
    innerHeight,
  });

  const { opacity } = useSpring({
    opacity: isDefined(hoveredSlice) ? 1 : 0,
    config: {
      tension: 300,
      friction: 30,
    },
  });

  if (bars.length === 0) {
    return null;
  }

  return (
    <g>
      <animated.g
        transform={`translate(${highlightPosition.x}, ${highlightPosition.y})`}
        opacity={opacity}
      >
        <rect
          width={highlightPosition.width}
          height={highlightPosition.height}
          fill={theme.background.transparent.medium}
          style={{ pointerEvents: 'none' }}
        />
      </animated.g>

      <rect
        x={0}
        y={0}
        width={innerWidth}
        height={innerHeight}
        fill="transparent"
        style={{ cursor: 'pointer' }}
        onMouseEnter={handleMouseMove}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
    </g>
  );
};
