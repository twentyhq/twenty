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
  crosshairX: number | null;
  innerHeight: number;
  innerWidth: number;
  onSliceHover: (data: SliceHoverData) => void;
};

export const CustomCrosshairLayer = ({
  points,
  crosshairX,
  innerHeight,
  innerWidth,
  onSliceHover,
}: CustomCrosshairLayerProps) => {
  const theme = useTheme();

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
      .sort((a, b) => a.x - b.x);
  }, [points]);

  const handleMouseMove = useCallback(
    (event: MouseEvent<SVGRectElement>) => {
      const svgRect =
        event.currentTarget.ownerSVGElement?.getBoundingClientRect();
      if (!isDefined(svgRect)) {
        return;
      }

      const CHART_MARGIN_LEFT = 70;
      const CHART_MARGIN_TOP = 20;
      const mouseX = event.clientX - svgRect.left - CHART_MARGIN_LEFT;
      const mouseY = event.clientY - svgRect.top - CHART_MARGIN_TOP;

      const nearestSlice = slices.reduce((nearest, slice) => {
        const currentDistance = Math.abs(slice.x - mouseX);
        const nearestDistance = Math.abs(nearest.x - mouseX);
        return currentDistance < nearestDistance ? slice : nearest;
      });

      if (nearestSlice.x === crosshairX) {
        return;
      }

      const closestPoint = nearestSlice.points.reduce((closest, p) => {
        const currentDistance = Math.abs(p.y - mouseY);
        const closestDistance = Math.abs(closest.y - mouseY);
        return currentDistance < closestDistance ? p : closest;
      });

      onSliceHover({
        sliceX: nearestSlice.x,
        mouseY,
        nearestSlice,
        closestPoint,
        svgRect,
      });
    },
    [slices, crosshairX, onSliceHover],
  );

  const transition = {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  };

  return (
    <g>
      {isDefined(crosshairX) && (
        <motion.line
          x1={crosshairX}
          x2={crosshairX}
          y1={0}
          y2={innerHeight}
          stroke={theme.font.color.primary}
          strokeWidth={1}
          strokeOpacity={0.5}
          strokeDasharray="4 4"
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
      />
    </g>
  );
};
