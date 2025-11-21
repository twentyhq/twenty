import {
  GraphWidgetTooltip,
  type GraphWidgetTooltipItem,
} from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { useGraphWidgetTooltipFloating } from '@/page-layout/widgets/graph/hooks/useGraphWidgetTooltipFloating';
import { useTheme } from '@emotion/react';
import { FloatingPortal, type VirtualElement } from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { isDefined } from 'twenty-shared/utils';

type GraphWidgetFloatingTooltipProps = {
  reference: Element | VirtualElement;
  boundary: Element;
  items: GraphWidgetTooltipItem[];
  indexLabel?: string;
  highlightedKey?: string;
  onGraphWidgetTooltipClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const GraphWidgetFloatingTooltip = ({
  reference,
  boundary,
  items,
  indexLabel,
  highlightedKey,
  onGraphWidgetTooltipClick,
  onMouseEnter,
  onMouseLeave,
}: GraphWidgetFloatingTooltipProps) => {
  const theme = useTheme();

  const { refs, floatingStyles } = useGraphWidgetTooltipFloating(
    reference,
    boundary,
  );

  if (!isDefined(boundary) || !(boundary instanceof HTMLElement)) {
    return null;
  }

  return (
    <FloatingPortal root={boundary}>
      <div
        ref={refs.setFloating}
        style={{ ...floatingStyles, zIndex: theme.lastLayerZIndex }}
        role="tooltip"
        aria-live="polite"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <AnimatePresence>
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: theme.animation.duration.fast,
              ease: 'easeInOut',
            }}
          >
            <GraphWidgetTooltip
              items={items}
              indexLabel={indexLabel}
              highlightedKey={highlightedKey}
              onGraphWidgetTooltipClick={onGraphWidgetTooltipClick}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </FloatingPortal>
  );
};
