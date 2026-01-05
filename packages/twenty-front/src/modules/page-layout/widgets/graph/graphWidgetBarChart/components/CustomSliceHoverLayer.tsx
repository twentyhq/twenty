import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { graphWidgetHoveredSliceIndexComponentState } from '@/page-layout/widgets/graph/graphWidgetBarChart/states/graphWidgetHoveredSliceIndexComponentState';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { type SliceHoverData } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/SliceHoverData';
import { buildSliceHoverData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/buildSliceHoverData';
import { computeBarChartSlices } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartSlices';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useTheme } from '@emotion/react';
import { type BarDatum, type ComputedBarDatum } from '@nivo/bar';
import { animated, useSpring } from '@react-spring/web';
import { useMemo, type MouseEvent } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { BarChartLayout } from '~/generated/graphql';

type CustomSliceHoverLayerProps = {
  bars: readonly ComputedBarDatum<BarDatum>[];
  innerWidth: number;
  innerHeight: number;
  marginLeft: number;
  marginTop: number;
  layout: BarChartLayout;
  groupMode: 'grouped' | 'stacked';
  onSliceHover: (data: SliceHoverData | null) => void;
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
  groupMode,
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

  const isVertical = layout === BarChartLayout.VERTICAL;

  const slices = useMemo(
    () =>
      computeBarChartSlices({
        bars,
        layout,
      }),
    [bars, layout],
  );

  const handleMouseMove = useRecoilCallback(
    ({ snapshot }) =>
      (event: MouseEvent<SVGRectElement>) => {
        const sliceData = buildSliceHoverData({
          mouseEvent: event,
          slices,
          marginLeft,
          marginTop,
          layout,
          groupMode,
        });
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
      slices,
      marginLeft,
      marginTop,
      layout,
      groupMode,
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

    const sliceData = buildSliceHoverData({
      mouseEvent: event,
      slices,
      marginLeft,
      marginTop,
      layout,
      groupMode,
    });

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

  const highlightX = isVertical
    ? (hoveredSlice?.sliceCenter ?? 0) -
      BAR_CHART_CONSTANTS.SLICE_HIGHLIGHT_THICKNESS / 2
    : 0;
  const highlightY = isVertical
    ? 0
    : (hoveredSlice?.sliceCenter ?? 0) -
      BAR_CHART_CONSTANTS.SLICE_HIGHLIGHT_THICKNESS / 2;
  const highlightWidth = isVertical
    ? BAR_CHART_CONSTANTS.SLICE_HIGHLIGHT_THICKNESS
    : innerWidth;
  const highlightHeight = isVertical
    ? innerHeight
    : BAR_CHART_CONSTANTS.SLICE_HIGHLIGHT_THICKNESS;

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
        transform={`translate(${highlightX}, ${highlightY})`}
        opacity={opacity}
      >
        <rect
          width={highlightWidth}
          height={highlightHeight}
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
