import { GRAPH_TOOLTIP_ANIMATION_SCALE_EXIT } from '@/page-layout/widgets/graph/components/constants/GraphTooltipAnimationScaleExit';
import { GRAPH_TOOLTIP_ANIMATION_SCALE_INITIAL } from '@/page-layout/widgets/graph/components/constants/GraphTooltipAnimationScaleInitial';
import {
  GraphWidgetTooltip,
  type GraphWidgetTooltipItem,
} from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { useTooltipFloating } from '@/page-layout/widgets/graph/hooks/useTooltipFloating';
import { createVirtualElementFromChartCoordinates } from '@/page-layout/widgets/graph/utils/createVirtualElementFromChartCoordinates';
import { createVirtualElementFromContainerOffset } from '@/page-layout/widgets/graph/utils/createVirtualElementFromContainerOffset';
import { useTheme } from '@emotion/react';
import { FloatingPortal, type VirtualElement } from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export type ElementAnchor = { type: 'element'; element: Element };
export type PointAnchor =
  | { type: 'point'; mode: 'absolute'; left: number; top: number }
  | {
      type: 'point';
      mode: 'relative';
      containerId: string;
      offsetLeft: number;
      offsetTop: number;
    };
export type AnchorSource = ElementAnchor | PointAnchor;

export type FloatingTooltipDescriptor = {
  items: GraphWidgetTooltipItem[];
  indexLabel?: string;
  highlightedKey?: string;
  linkTo?: string;
  anchor: AnchorSource;
};

type GraphWidgetFloatingTooltipProps = {
  descriptor: FloatingTooltipDescriptor | null;
  onRequestHide?: () => void;
  onCancelHide?: () => void;
};

export const GraphWidgetFloatingTooltip = ({
  descriptor,
  onRequestHide,
  onCancelHide,
}: GraphWidgetFloatingTooltipProps) => {
  const theme = useTheme();

  const { reference, boundary } = useMemo((): {
    reference: Element | VirtualElement | null;
    boundary: Element | null;
  } => {
    if (!descriptor) return { reference: null, boundary: null };
    if (descriptor.anchor.type === 'element') {
      const el = descriptor.anchor.element;
      const container = el.closest('[id]');
      return { reference: el, boundary: container };
    }
    if (descriptor.anchor.mode === 'relative') {
      const container = document.getElementById(descriptor.anchor.containerId);
      if (isDefined(container)) {
        return {
          reference: createVirtualElementFromContainerOffset(
            container,
            descriptor.anchor.offsetLeft,
            descriptor.anchor.offsetTop,
          ),
          boundary: container,
        };
      }
      return {
        reference: createVirtualElementFromChartCoordinates({
          left: descriptor.anchor.offsetLeft,
          top: descriptor.anchor.offsetTop,
        }),
        boundary: null,
      };
    }
    return {
      reference: createVirtualElementFromChartCoordinates({
        left: descriptor.anchor.left,
        top: descriptor.anchor.top,
      }),
      boundary: null,
    };
  }, [descriptor]);

  const { refs, floatingStyles } = useTooltipFloating(reference, boundary);

  if (!descriptor) return null;

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        style={{ ...floatingStyles, zIndex: theme.lastLayerZIndex }}
        role="tooltip"
        aria-live="polite"
        onMouseEnter={() => onCancelHide?.()}
        onMouseLeave={() => onRequestHide?.()}
      >
        <AnimatePresence>
          <motion.div
            initial={{
              opacity: 0,
              scale: GRAPH_TOOLTIP_ANIMATION_SCALE_INITIAL,
            }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: GRAPH_TOOLTIP_ANIMATION_SCALE_EXIT }}
            transition={{
              duration: theme.animation.duration.fast,
              ease: 'easeInOut',
            }}
          >
            <GraphWidgetTooltip
              items={descriptor.items}
              indexLabel={descriptor.indexLabel}
              highlightedKey={descriptor.highlightedKey}
              linkTo={descriptor.linkTo}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </FloatingPortal>
  );
};
