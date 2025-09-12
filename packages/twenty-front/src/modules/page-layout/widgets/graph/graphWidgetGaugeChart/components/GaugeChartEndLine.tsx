import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';
import { type RadialBarCustomLayerProps } from '@nivo/radial-bar';

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
  if (!valueBar) {
    return null;
  }

  const endAngle = valueBar.arc.endAngle - Math.PI / 2;
  const arcInnerRadius = valueBar.arc.innerRadius;
  const arcOuterRadius = valueBar.arc.outerRadius;

  const [centerX, centerY] = center;
  const x1 = centerX + Math.cos(endAngle) * arcInnerRadius;
  const y1 = centerY + Math.sin(endAngle) * arcInnerRadius;
  const x2 = centerX + Math.cos(endAngle) * arcOuterRadius;
  const y2 = centerY + Math.sin(endAngle) * arcOuterRadius;

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
