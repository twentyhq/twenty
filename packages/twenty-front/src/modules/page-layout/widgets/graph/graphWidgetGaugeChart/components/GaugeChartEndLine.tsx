import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';
import { calculateGaugeChartEndLineCoordinates } from '@/page-layout/widgets/graph/graphWidgetGaugeChart/utils/calculateGaugeChartEndLineCoordinates';
import { type RadialBarCustomLayerProps } from '@nivo/radial-bar';
import { isDefined } from 'twenty-shared/utils';

type GaugeChartEndLineProps = {
  center: RadialBarCustomLayerProps['center'];
  bars: RadialBarCustomLayerProps['bars'];
  clampedNormalizedValue: number;
  colorScheme: GraphColorScheme;
};

export const GaugeChartEndLine = ({
  center,
  bars,
  clampedNormalizedValue,
  colorScheme,
}: GaugeChartEndLineProps) => {
  if (clampedNormalizedValue === 0) {
    return null;
  }

  const valueBar = bars?.find((bar) => bar.data.x === 'value');
  if (!isDefined(valueBar)) {
    return null;
  }

  const [centerX, centerY] = center;
  const { x1, y1, x2, y2 } = calculateGaugeChartEndLineCoordinates(
    valueBar.arc.endAngle,
    centerX,
    centerY,
    valueBar.arc.innerRadius,
    valueBar.arc.outerRadius,
  );

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={colorScheme.solid}
        strokeWidth={1}
      />
    </g>
  );
};
