import { GRAPH_TOOLTIP_BOUNDARY_PADDING_PX } from '@/page-layout/widgets/graph/constants/GraphTooltipBoundaryPaddingPx';
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
  referenceElement: Element | VirtualElement | null,
  boundaryElement: Element | null,
  tooltipOffsetFromAnchorInPx: number,
) => {
  const virtualElement = useMemo(() => {
    if (!isDefined(referenceElement)) return null;
    if (referenceElement instanceof Element) {
      return createVirtualElementFromSVGElement(referenceElement);
    }
    return referenceElement;
  }, [referenceElement]);

  const rootBoundary = document.querySelector('#root') ?? undefined;

  const { refs, x, y, isPositioned } = useFloating({
    elements: {
      reference: virtualElement,
    },
    placement: 'left',
    strategy: 'fixed',
    middleware: [
      offset(tooltipOffsetFromAnchorInPx),
      flip({
        fallbackPlacements: ['right', 'top', 'bottom'],
        boundary: boundaryElement ?? rootBoundary,
      }),
      shift({
        boundary: boundaryElement ?? rootBoundary,
        padding: GRAPH_TOOLTIP_BOUNDARY_PADDING_PX,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  return { refs, x, y, isPositioned };
};
