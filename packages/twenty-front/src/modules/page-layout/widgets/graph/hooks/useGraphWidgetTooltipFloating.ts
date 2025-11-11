import { GRAPH_TOOLTIP_BOUNDARY_PADDING_PX } from '@/page-layout/widgets/graph/constants/GraphTooltipBoundaryPaddingPx';
import { GRAPH_TOOLTIP_OFFSET_PX } from '@/page-layout/widgets/graph/constants/GraphTooltipOffsetPx';
import { createVirtualElementFromSVGElement } from '@/page-layout/widgets/graph/utils/createVirtualElementFromSVGElement';
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

export const useGraphWidgetTooltipFloating = (
  element: Element | VirtualElement | null,
  boundaryElement?: Element | null,
) => {
  const virtualElement = useMemo(() => {
    if (!isDefined(element)) return null;
    if (element instanceof Element) {
      return createVirtualElementFromSVGElement(element);
    }
    return element;
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
        boundary:
          boundaryElement ?? document.querySelector('#root') ?? undefined,
      }),
      shift({
        boundary:
          boundaryElement ?? document.querySelector('#root') ?? undefined,
        padding: GRAPH_TOOLTIP_BOUNDARY_PADDING_PX,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });
};
