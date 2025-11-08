import { createVirtualElementFromSVGElement } from '@/page-layout/widgets/graph/utils/createVirtualElementFromSVGElement';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  type VirtualElement,
} from '@floating-ui/react';
import { GRAPH_TOOLTIP_OFFSET_PX } from '@/page-layout/widgets/graph/constants/GraphTooltipOffsetPx';
import { GRAPH_TOOLTIP_BOUNDARY_PADDING_PX } from '@/page-layout/widgets/graph/constants/GraphTooltipBoundaryPaddingPx';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useTooltipFloating = (
  element: Element | VirtualElement | null,
) => {
  const virtualElement = useMemo(() => {
    if (!isDefined(element)) {
      return null;
    }
    if (
      typeof (element as any).getBoundingClientRect === 'function' &&
      !(element as Element).nodeType
    ) {
      return element as VirtualElement;
    }
    return createVirtualElementFromSVGElement(element as Element);
  }, [element]);

  return useFloating({
    elements: {
      reference: virtualElement,
    },
    placement: 'left',
    strategy: 'fixed',
    middleware: [
      offset(GRAPH_TOOLTIP_OFFSET_PX),
      flip({
        fallbackPlacements: ['right', 'top', 'bottom'],
        boundary: document.querySelector('#root') ?? undefined,
      }),
      shift({
        boundary: document.querySelector('#root') ?? undefined,
        padding: GRAPH_TOOLTIP_BOUNDARY_PADDING_PX,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });
};
