import { graphWidgetHoveredSliceIndexComponentState } from '@/page-layout/widgets/graph/graphWidgetBarChart/states/graphWidgetHoveredSliceIndexComponentState';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import {
  computeBarChartSlices,
  findSliceAtPosition,
} from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartSlices';
import { createSliceVirtualElement } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/createSliceVirtualElement';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { type VirtualElement } from '@floating-ui/react';
import { type BarDatum, type ComputedBarDatum } from '@nivo/bar';
import { useCallback, useMemo, type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { BarChartLayout } from '~/generated/graphql';

export type SliceHoverData = {
  slice: BarChartSlice;
  virtualElement: VirtualElement;
};

type CustomSliceHoverLayerProps = {
  bars: readonly ComputedBarDatum<BarDatum>[];
  innerWidth: number;
  innerHeight: number;
  marginLeft: number;
  marginTop: number;
  layout: BarChartLayout;
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
  onSliceHover,
  onSliceClick,
  onSliceLeave,
}: CustomSliceHoverLayerProps) => {
  const hoveredSliceIndex = useRecoilComponentValue(
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
        innerWidth,
        innerHeight,
        layout,
      }),
    [bars, innerWidth, innerHeight, layout],
  );

  const buildSliceData = useCallback(
    (event: MouseEvent<SVGRectElement>): SliceHoverData | null => {
      const svgRect =
        event.currentTarget.ownerSVGElement?.getBoundingClientRect();
      if (!isDefined(svgRect)) {
        return null;
      }

      const mouseX = event.clientX - svgRect.left - marginLeft;
      const mouseY = event.clientY - svgRect.top - marginTop;

      const position = isVertical ? mouseX : mouseY;
      const slice = findSliceAtPosition(slices, position);

      if (!isDefined(slice)) {
        return null;
      }

      const virtualElement = createSliceVirtualElement({
        slice,
        svgRect,
        marginLeft,
        marginTop,
        layout,
      });

      return {
        slice,
        virtualElement,
      };
    },
    [marginLeft, marginTop, isVertical, slices, layout],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent<SVGRectElement>) => {
      const sliceData = buildSliceData(event);

      if (!isDefined(sliceData)) {
        if (isDefined(hoveredSliceIndex)) {
          setHoveredSliceIndex(null);
          onSliceHover(null);
        }
        return;
      }

      if (sliceData.slice.indexValue === hoveredSliceIndex) {
        return;
      }

      setHoveredSliceIndex(sliceData.slice.indexValue);
      onSliceHover(sliceData);
    },
    [buildSliceData, hoveredSliceIndex, setHoveredSliceIndex, onSliceHover],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredSliceIndex(null);
    onSliceLeave();
  }, [setHoveredSliceIndex, onSliceLeave]);

  const handleClick = useCallback(
    (event: MouseEvent<SVGRectElement>) => {
      if (!isDefined(onSliceClick)) {
        return;
      }

      const sliceData = buildSliceData(event);
      if (!isDefined(sliceData)) {
        return;
      }

      onSliceClick(sliceData.slice);
    },
    [buildSliceData, onSliceClick],
  );

  if (bars.length === 0) {
    return null;
  }

  return (
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
  );
};
