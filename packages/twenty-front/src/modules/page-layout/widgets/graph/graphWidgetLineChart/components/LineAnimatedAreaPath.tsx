import { LEGEND_HIGHLIGHT_DIMMED_OPACITY } from '@/page-layout/widgets/graph/constants/LegendHighlightDimmedOpacity.constant';
import { graphWidgetHighlightedLegendIdComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHighlightedLegendIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useAnimatedPath } from '@nivo/core';
import { animated } from '@react-spring/web';
import { isDefined } from 'twenty-shared/utils';

type LineAnimatedAreaPathProps = {
  id: string;
  path: string;
  fillId: string;
};

export const LineAnimatedAreaPath = ({
  id,
  path,
  fillId,
}: LineAnimatedAreaPathProps) => {
  const animatedPath = useAnimatedPath(path);

  const highlightedLegendId = useRecoilComponentValue(
    graphWidgetHighlightedLegendIdComponentState,
  );

  const isDimmed = isDefined(highlightedLegendId) && highlightedLegendId !== id;

  return (
    <animated.path
      d={animatedPath}
      fill={`url(#${fillId})`}
      strokeWidth={0}
      opacity={isDimmed ? LEGEND_HIGHLIGHT_DIMMED_OPACITY : 1}
      style={{ transition: 'opacity 0.15s ease-in-out' }}
    />
  );
};
