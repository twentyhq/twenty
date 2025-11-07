import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  type VirtualElement,
} from '@floating-ui/react';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

const TOOLTIP_OFFSET_PX = 2;
const TOOLTIP_BOUNDARY_PADDING_PX = 8;

const createVirtualElementFromBarElement = (
  barElement: SVGRectElement,
): VirtualElement | null => {
  const svgContainer = barElement.closest('svg');
  if (!isDefined(svgContainer)) {
    return null;
  }

  return {
    getBoundingClientRect: () => {
      const barRect = barElement.getBoundingClientRect();

      // Create a 1px tall virtual element at the top of the bar
      // This allows the tooltip to position relative to the bar's top edge
      return {
        left: barRect.left,
        right: barRect.right,
        top: barRect.top,
        bottom: barRect.top + 1,
        width: barRect.width,
        height: 1,
        x: barRect.left,
        y: barRect.top,
      };
    },
  };
};

export const useTooltipFloating = (barElement: SVGRectElement | null) => {
  const virtualElement = useMemo(() => {
    if (!isDefined(barElement)) {
      return null;
    }
    return createVirtualElementFromBarElement(barElement);
  }, [barElement]);

  return useFloating({
    elements: {
      reference: virtualElement,
    },
    placement: 'left',
    strategy: 'fixed',
    middleware: [
      offset(TOOLTIP_OFFSET_PX),
      flip({
        fallbackPlacements: ['right', 'top', 'bottom'],
        boundary: document.querySelector('#root') ?? undefined,
      }),
      shift({
        boundary: document.querySelector('#root') ?? undefined,
        padding: TOOLTIP_BOUNDARY_PADDING_PX,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });
};
