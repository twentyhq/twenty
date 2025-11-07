import { createVirtualElementFromSVGElement } from '@/page-layout/widgets/graph/utils/createVirtualElementFromSVGElement';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

const TOOLTIP_OFFSET_PX = 2;
const TOOLTIP_BOUNDARY_PADDING_PX = 8;

export const useTooltipFloating = (element: Element | null) => {
  const virtualElement = useMemo(() => {
    if (!isDefined(element)) {
      return null;
    }
    return createVirtualElementFromSVGElement(element);
  }, [element]);

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
