import { LEGEND_HIGHLIGHT_DIMMED_OPACITY } from '@/page-layout/widgets/graph/constants/LegendHighlightDimmedOpacity.constant';
import { graphWidgetHighlightedLegendIdComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHighlightedLegendIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useAnimatedPath } from '@nivo/core';
import {
  type ComputedSeries,
  type LineCustomSvgLayerProps,
  type LineSeries,
} from '@nivo/line';
import { animated } from '@react-spring/web';
import { isDefined } from 'twenty-shared/utils';

type CustomLinesLayerProps = {
  series: readonly ComputedSeries<LineSeries>[];
  lineGenerator: LineCustomSvgLayerProps<LineSeries>['lineGenerator'];
  lineWidth: number;
};

type AnimatedLinePathProps = {
  id: string;
  path: string;
  color: string;
  lineWidth: number;
};

const AnimatedLinePath = ({
  id,
  path,
  color,
  lineWidth,
}: AnimatedLinePathProps) => {
  const animatedPath = useAnimatedPath(path);

  const highlightedLegendId = useRecoilComponentValue(
    graphWidgetHighlightedLegendIdComponentState,
  );

  const isDimmed = isDefined(highlightedLegendId) && highlightedLegendId !== id;

  return (
    <animated.path
      d={animatedPath}
      fill="none"
      stroke={color}
      strokeWidth={lineWidth}
      opacity={isDimmed ? LEGEND_HIGHLIGHT_DIMMED_OPACITY : 1}
      style={{ transition: 'opacity 0.15s ease-in-out' }}
    />
  );
};

export const CustomLinesLayer = ({
  series,
  lineGenerator,
  lineWidth,
}: CustomLinesLayerProps) => {
  return (
    <g>
      {[...series].reverse().map((seriesItem) => {
        const path = lineGenerator(
          seriesItem.data.map((point) => point.position),
        );

        if (!isDefined(path)) {
          return null;
        }

        return (
          <AnimatedLinePath
            key={seriesItem.id}
            id={String(seriesItem.id)}
            path={path}
            color={seriesItem.color}
            lineWidth={lineWidth}
          />
        );
      })}
    </g>
  );
};
