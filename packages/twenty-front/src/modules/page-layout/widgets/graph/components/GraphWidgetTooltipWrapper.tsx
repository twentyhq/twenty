import { useTooltipFloating } from '@/page-layout/widgets/graph/hooks/useTooltipFloating';
import { useTheme } from '@emotion/react';
import { FloatingPortal, type VirtualElement } from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

type GraphWidgetTooltipWrapperProps = {
  isVisible: boolean;
  anchorElement: Element | VirtualElement | null;
  content: ReactNode;
  interactive: boolean;
  onCancelHide: () => void;
  onHide: () => void;
};

export const GraphWidgetTooltipWrapper = ({
  isVisible,
  anchorElement,
  content,
  interactive,
  onCancelHide,
  onHide,
}: GraphWidgetTooltipWrapperProps) => {
  const theme = useTheme();
  const { refs, floatingStyles } = useTooltipFloating(anchorElement);

  if (!isVisible || !isDefined(anchorElement) || !isDefined(content)) {
    return null;
  }

  return (
    <FloatingPortal>
      <AnimatePresence>
        <div
          ref={refs.setFloating}
          style={{ ...floatingStyles, zIndex: theme.lastLayerZIndex }}
          role="tooltip"
          aria-live="polite"
          onMouseEnter={interactive ? onCancelHide : undefined}
          onMouseLeave={interactive ? onHide : undefined}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: theme.animation.duration.fast,
              ease: 'easeInOut',
            }}
          >
            {content}
          </motion.div>
        </div>
      </AnimatePresence>
    </FloatingPortal>
  );
};
