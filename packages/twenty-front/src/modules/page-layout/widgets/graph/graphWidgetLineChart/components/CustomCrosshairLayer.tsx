import { LINE_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartConstants';
import { graphWidgetLineCrosshairXComponentState } from '@/page-layout/widgets/graph/graphWidgetLineChart/states/graphWidgetLineCrosshairXComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import { type LineSeries, type Point } from '@nivo/line';
import { motion } from 'framer-motion';
import { useCallback, useMemo, type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';

export type SliceHoverData = {
  sliceX: number;
  mouseY: number;
  nearestSlice: {
    xValue: string;
    points: Point<LineSeries>[];
    x: number;
  };
  closestPoint: Point<LineSeries>;
  svgRect: DOMRect;
};

type CustomCrosshairLayerProps = {
  points: readonly Point<LineSeries>[];
  innerHeight: number;
  innerWidth: number;
  marginLeft: number;
  marginTop: number;
  onSliceHover: (data: SliceHoverData) => void;
  onSliceClick?: (data: SliceHoverData) => void;
  onRectLeave: (relatedTarget: EventTarget | null) => void;
};

export const CustomCrosshairLayer = ({
  points,
  innerHeight,
  innerWidth,
  marginLeft,
  marginTop,
  onSliceHover,
  onSliceClick,
  onRectLeave,
}: CustomCrosshairLayerProps) => {
  const theme = useTheme();
  const crosshairX = useRecoilComponentValue(
    graphWidgetLineCrosshairXComponentState,
  );

  const slices = useMemo(() => {
    const sliceMap = new Map<string, Point<LineSeries>[]>();

    points.forEach((point) => {
      const key = String(point.data.x ?? '');
      if (!sliceMap.has(key)) {
        sliceMap.set(key, []);
      }
      sliceMap.get(key)?.push(point);
    });

    return Array.from(sliceMap.entries())
      .map(([xValue, slicePoints]) => ({
        xValue,
        points: slicePoints,
        x: slicePoints[0]?.x ?? 0,
      }))
      .sort((sliceA, sliceB) => sliceA.x - sliceB.x);
  }, [points]);

  const buildSliceData = useCallback(
    (event: MouseEvent<SVGRectElement>) => {
      const svgRect =
        event.currentTarget.ownerSVGElement?.getBoundingClientRect();
      if (!isDefined(svgRect)) {
        return null;
      }

      const mouseX = event.clientX - svgRect.left - marginLeft;
      const mouseY = event.clientY - svgRect.top - marginTop;

      const nearestSlice = slices.reduce((nearest, slice) => {
        const currentDistance = Math.abs(slice.x - mouseX);
        const nearestDistance = Math.abs(nearest.x - mouseX);
        return currentDistance < nearestDistance ? slice : nearest;
      });

      const closestPoint = nearestSlice.points.reduce(
        (closestPointCandidate, pointCandidate) => {
          const currentDistance = Math.abs(pointCandidate.y - mouseY);
          const closestDistance = Math.abs(closestPointCandidate.y - mouseY);
          return currentDistance < closestDistance
            ? pointCandidate
            : closestPointCandidate;
        },
      );

      return {
        sliceX: nearestSlice.x,
        mouseY,
        nearestSlice,
        closestPoint,
        svgRect,
      };
    },
    [marginLeft, marginTop, slices],
  );

  const handleMouseMove = (event: MouseEvent<SVGRectElement>) => {
    const sliceData = buildSliceData(event);
    if (!isDefined(sliceData)) {
      return;
    }

    if (sliceData.sliceX === crosshairX) {
      return;
    }

    onSliceHover(sliceData);
  };

  const handleClick = useCallback(
    (event: MouseEvent<SVGRectElement>) => {
      if (!isDefined(onSliceClick)) {
        return;
      }

      const sliceData = buildSliceData(event);
      if (!isDefined(sliceData)) {
        return;
      }

      onSliceClick(sliceData);
    },
    [buildSliceData, onSliceClick],
  );

  const transition = {
    type: 'spring',
    stiffness: LINE_CHART_CONSTANTS.CROSSHAIR_TRANSITION_STIFFNESS,
    damping: LINE_CHART_CONSTANTS.CROSSHAIR_TRANSITION_DAMPING,
  } as const;

  return (
    <g>
      {isDefined(crosshairX) && (
        <motion.line
          x1={crosshairX}
          x2={crosshairX}
          y1={0}
          y2={innerHeight}
          stroke={theme.font.color.primary}
          strokeWidth={LINE_CHART_CONSTANTS.CROSSHAIR_STROKE_WIDTH}
          strokeOpacity={LINE_CHART_CONSTANTS.CROSSHAIR_STROKE_OPACITY}
          strokeDasharray={LINE_CHART_CONSTANTS.CROSSHAIR_DASH_ARRAY}
          initial={{ x1: crosshairX, x2: crosshairX, opacity: 0 }}
          animate={{ x1: crosshairX, x2: crosshairX, opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={transition}
          pointerEvents="none"
        />
      )}

      <rect
        x={0}
        y={0}
        width={innerWidth}
        height={innerHeight}
        fill="transparent"
        style={{ cursor: 'pointer' }}
        onMouseEnter={handleMouseMove}
        onMouseMove={handleMouseMove}
        onMouseLeave={(event) => onRectLeave(event.relatedTarget)}
        onClick={handleClick}
      />
    </g>
  );
};
