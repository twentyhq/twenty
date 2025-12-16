import { LEGEND_HIGHLIGHT_DIMMED_OPACITY } from '@/page-layout/widgets/graph/constants/LegendHighlightDimmedOpacity.constant';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { graphWidgetHighlightedLegendIdComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHighlightedLegendIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useArcsTransition } from '@nivo/arcs';
import { type MouseEventHandler, type PieCustomLayerProps } from '@nivo/pie';
import { animated } from '@react-spring/web';
import { isDefined } from 'twenty-shared/utils';

type CustomArcsLayerProps = Pick<
  PieCustomLayerProps<PieChartDataItem>,
  'dataWithArc' | 'arcGenerator' | 'centerX' | 'centerY'
> & {
  onMouseMove?: MouseEventHandler<PieChartDataItem, SVGPathElement>;
  onMouseLeave?: MouseEventHandler<PieChartDataItem, SVGPathElement>;
  onClick?: MouseEventHandler<PieChartDataItem, SVGPathElement>;
};

export const CustomArcsLayer = ({
  dataWithArc,
  arcGenerator,
  centerX,
  centerY,
  onMouseMove,
  onMouseLeave,
  onClick,
}: CustomArcsLayerProps) => {
  const highlightedLegendId = useRecoilComponentValue(
    graphWidgetHighlightedLegendIdComponentState,
  );

  const { transition, interpolate } = useArcsTransition(
    [...dataWithArc],
    'innerRadius',
  );

  return (
    <g transform={`translate(${centerX},${centerY})`}>
      {transition((style, datum) => {
        const isDimmed =
          isDefined(highlightedLegendId) &&
          String(highlightedLegendId) !== String(datum.id);

        return (
          <animated.path
            key={datum.id}
            d={interpolate(
              style.startAngle,
              style.endAngle,
              style.innerRadius,
              style.outerRadius,
              arcGenerator,
            )}
            fill={datum.color}
            opacity={isDimmed ? LEGEND_HIGHLIGHT_DIMMED_OPACITY : 1}
            style={{
              transition: 'opacity 0.15s ease-in-out',
            }}
            onMouseMove={
              onMouseMove ? (event) => onMouseMove(datum, event) : undefined
            }
            onMouseLeave={
              onMouseLeave ? (event) => onMouseLeave(datum, event) : undefined
            }
            onClick={onClick ? (event) => onClick(datum, event) : undefined}
          />
        );
      })}
    </g>
  );
};
