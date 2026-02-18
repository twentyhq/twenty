import { LEGEND_HIGHLIGHT_DIMMED_OPACITY } from '@/page-layout/widgets/graph/constants/LegendHighlightDimmedOpacity.constant';
import { type PieChartDataItemWithColor } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { graphWidgetHighlightedLegendIdComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHighlightedLegendIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useArcsTransition } from '@nivo/arcs';
import { type MouseEventHandler, type PieCustomLayerProps } from '@nivo/pie';
import { animated } from '@react-spring/web';
import { isDefined } from 'twenty-shared/utils';

type CustomArcsLayerProps = Pick<
  PieCustomLayerProps<PieChartDataItemWithColor>,
  'dataWithArc' | 'arcGenerator' | 'centerX' | 'centerY'
> & {
  padAngle: number;
  onMouseMove?: MouseEventHandler<PieChartDataItemWithColor, SVGElement>;
  onMouseLeave?: MouseEventHandler<PieChartDataItemWithColor, SVGElement>;
  onClick?: MouseEventHandler<PieChartDataItemWithColor, SVGElement>;
};

export const CustomArcsLayer = ({
  dataWithArc,
  arcGenerator,
  centerX,
  centerY,
  padAngle,
  onMouseMove,
  onMouseLeave,
  onClick,
}: CustomArcsLayerProps) => {
  const highlightedLegendId = useRecoilComponentValue(
    graphWidgetHighlightedLegendIdComponentState,
  );

  const { transition } = useArcsTransition([...dataWithArc], 'innerRadius');

  return (
    <g transform={`translate(${centerX},${centerY})`}>
      {transition((_, datum) => {
        const isDimmed =
          isDefined(highlightedLegendId) &&
          String(highlightedLegendId) !== String(datum.id);
        const arcLength = datum.arc.endAngle - datum.arc.startAngle;
        const padAngleRadians = (padAngle * Math.PI) / 180;
        const clampedPadAngle = Math.min(
          padAngleRadians,
          Math.max(0, arcLength - 0.0001),
        );
        const halfPadAngle = clampedPadAngle / 2;
        const hitAreaPath = arcGenerator(datum.arc);
        const paddedArc = clampedPadAngle
          ? {
              ...datum.arc,
              startAngle: datum.arc.startAngle + halfPadAngle,
              endAngle: datum.arc.endAngle - halfPadAngle,
            }
          : datum.arc;
        const visiblePath = arcGenerator(paddedArc);

        return (
          <g
            key={datum.id}
            pointerEvents="all"
            onMouseMove={
              onMouseMove ? (event) => onMouseMove(datum, event) : undefined
            }
            onMouseLeave={
              onMouseLeave ? (event) => onMouseLeave(datum, event) : undefined
            }
            onClick={onClick ? (event) => onClick(datum, event) : undefined}
          >
            <animated.path d={hitAreaPath ?? undefined} fill="transparent" />
            <animated.path
              d={visiblePath ?? undefined}
              fill={datum.color}
              opacity={isDimmed ? LEGEND_HIGHLIGHT_DIMMED_OPACITY : 1}
              style={{
                transition: 'opacity 0.15s ease-in-out',
              }}
            />
          </g>
        );
      })}
    </g>
  );
};
