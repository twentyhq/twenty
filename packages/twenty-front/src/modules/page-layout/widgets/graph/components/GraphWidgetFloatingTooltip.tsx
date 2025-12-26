import {
  GraphWidgetTooltip,
  type GraphWidgetTooltipItem,
} from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { useGraphWidgetTooltipFloating } from '@/page-layout/widgets/graph/hooks/useGraphWidgetTooltipFloating';
import { useTheme } from '@emotion/react';
import { FloatingPortal, type VirtualElement } from '@floating-ui/react';
import { animated, useSpring } from '@react-spring/web';
import { isDefined } from 'twenty-shared/utils';

type GraphWidgetFloatingTooltipProps = {
  reference: Element | VirtualElement | null;
  boundary: Element | null;
  tooltipOffsetFromAnchorInPx: number;
  items: GraphWidgetTooltipItem[];
  indexLabel?: string;
  highlightedKey?: string;
  onGraphWidgetTooltipClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  disablePointerEvents?: boolean;
};

export const GraphWidgetFloatingTooltip = ({
  reference,
  boundary,
  tooltipOffsetFromAnchorInPx,
  items,
  indexLabel,
  highlightedKey,
  onGraphWidgetTooltipClick,
  onMouseEnter,
  onMouseLeave,
  disablePointerEvents = false,
}: GraphWidgetFloatingTooltipProps) => {
  const theme = useTheme();

  const { refs, x, y, isPositioned } = useGraphWidgetTooltipFloating(
    reference,
    boundary,
    tooltipOffsetFromAnchorInPx,
  );

  const xPos = x ?? 0;
  const yPos = y ?? 0;

  const shouldShow = isDefined(reference) && items.length > 0;
  const isVisible = shouldShow && isPositioned;

  const springStyles = useSpring({
    from: {
      transform: `translate(${xPos}px, ${yPos}px)`,
      opacity: 0,
    },
    to: {
      transform: `translate(${xPos}px, ${yPos}px)`,
      opacity: isVisible ? 1 : 0,
    },
    config: {
      tension: 300,
      friction: 30,
    },
    immediate: !isPositioned || !shouldShow,
    reset: !shouldShow,
  });

  if (!isDefined(boundary) || !(boundary instanceof HTMLElement)) {
    return null;
  }

  return (
    <FloatingPortal root={boundary}>
      <animated.div
        ref={refs.setFloating}
        style={{
          ...springStyles,
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: theme.lastLayerZIndex,
          pointerEvents: disablePointerEvents || !isVisible ? 'none' : 'auto',
        }}
        role="tooltip"
        aria-live="polite"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {items.length > 0 && (
          <GraphWidgetTooltip
            items={items}
            indexLabel={indexLabel}
            highlightedKey={highlightedKey}
            onGraphWidgetTooltipClick={onGraphWidgetTooltipClick}
          />
        )}
      </animated.div>
    </FloatingPortal>
  );
};
